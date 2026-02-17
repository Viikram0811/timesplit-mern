import Schedule from '../models/Schedule.js';
import Task from '../models/Task.js';
import { generateSchedule, rescheduleMissedTasks } from '../services/schedulerService.js';

// @desc    Generate schedule for user's tasks
// @route   POST /api/schedules/generate
// @access  Private
export const generateUserSchedule = async (req, res, next) => {
  try {
    const { stressLevel } = req.body;
    
    // Get all active tasks for user
    const tasks = await Task.find({
      user: req.user.id,
      status: { $in: ['Pending', 'In Progress'] }
    });

    if (tasks.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No active tasks found to schedule'
      });
    }

    // Clear existing scheduled (not completed) schedules
    await Schedule.deleteMany({
      user: req.user.id,
      status: { $in: ['Scheduled', 'Missed'] }
    });

    // Generate new schedule
    const result = await generateSchedule(req.user.id, tasks, stressLevel || 5);

    // Save schedules to database
    const schedules = result.schedules.map(schedule => ({
      ...schedule,
      user: req.user.id
    }));

    const createdSchedules = await Schedule.insertMany(schedules);

    res.status(201).json({
      success: true,
      count: createdSchedules.length,
      schedules: createdSchedules,
      message: result.message
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user schedules
// @route   GET /api/schedules
// @access  Private
export const getSchedules = async (req, res, next) => {
  try {
    const { date, status } = req.query;
    const query = { user: req.user.id };

    if (date) {
      const targetDate = new Date(date);
      targetDate.setHours(0, 0, 0, 0);
      const nextDay = new Date(targetDate);
      nextDay.setDate(nextDay.getDate() + 1);
      query.scheduledDate = { $gte: targetDate, $lt: nextDay };
    }

    if (status) {
      query.status = status;
    }

    const schedules = await Schedule.find(query)
      .populate('task', 'title subject priority deadline estimatedTime')
      .sort({ scheduledDate: 1, startTime: 1 });

    res.status(200).json({
      success: true,
      count: schedules.length,
      schedules
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update schedule status
// @route   PUT /api/schedules/:id
// @access  Private
export const updateSchedule = async (req, res, next) => {
  try {
    const { status } = req.body;

    let schedule = await Schedule.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: 'Schedule not found'
      });
    }

    if (status) {
      schedule.status = status;
      if (status === 'Completed') {
        schedule.completedAt = new Date();
        // Update task status if all schedules completed
        const task = await Task.findById(schedule.task);
        const remainingSchedules = await Schedule.countDocuments({
          task: schedule.task,
          status: { $ne: 'Completed' }
        });
        if (remainingSchedules === 0 && task.status !== 'Completed') {
          task.status = 'Completed';
          task.completedAt = new Date();
          await task.save();
        }
      }
    }

    await schedule.save();

    res.status(200).json({
      success: true,
      schedule
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reschedule missed tasks
// @route   POST /api/schedules/reschedule
// @access  Private
export const rescheduleMissed = async (req, res, next) => {
  try {
    const result = await rescheduleMissedTasks(req.user.id);

    res.status(200).json({
      success: true,
      ...result
    });
  } catch (error) {
    next(error);
  }
};
