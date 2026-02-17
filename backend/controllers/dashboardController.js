import Task from '../models/Task.js';
import Schedule from '../models/Schedule.js';
import StressLog from '../models/StressLog.js';
import User from '../models/User.js';

// @desc    Get dashboard data
// @route   GET /api/dashboard
// @access  Private
export const getDashboard = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const weekFromNow = new Date(today);
    weekFromNow.setDate(weekFromNow.getDate() + 7);

    // Today's schedule
    const todaySchedules = await Schedule.find({
      user: userId,
      scheduledDate: { $gte: today, $lt: tomorrow },
      status: { $ne: 'Completed' }
    })
      .populate('task', 'title subject priority deadline')
      .sort({ startTime: 1 });

    // Upcoming deadlines (next 7 days)
    const upcomingTasks = await Task.find({
      user: userId,
      deadline: { $gte: today, $lte: weekFromNow },
      status: { $ne: 'Completed' }
    })
      .sort({ deadline: 1 })
      .limit(10);

    // Stress analytics (last 7 days)
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const stressLogs = await StressLog.find({
      user: userId,
      date: { $gte: sevenDaysAgo }
    }).sort({ date: 1 });

    const stressTrend = stressLogs.map(log => ({
      date: log.date.toISOString().split('T')[0],
      level: log.stressLevel
    }));

    const avgStress = stressLogs.length > 0
      ? stressLogs.reduce((sum, log) => sum + log.stressLevel, 0) / stressLogs.length
      : 0;

    // Completion statistics
    const totalTasks = await Task.countDocuments({ user: userId });
    const completedTasks = await Task.countDocuments({
      user: userId,
      status: 'Completed'
    });
    const pendingTasks = await Task.countDocuments({
      user: userId,
      status: 'Pending'
    });
    const inProgressTasks = await Task.countDocuments({
      user: userId,
      status: 'In Progress'
    });

    // Productivity summary (last 7 days)
    const completedSchedules = await Schedule.countDocuments({
      user: userId,
      status: 'Completed',
      completedAt: { $gte: sevenDaysAgo }
    });

    const missedSchedules = await Schedule.countDocuments({
      user: userId,
      status: 'Missed',
      scheduledDate: { $gte: sevenDaysAgo }
    });

    // Priority distribution
    const priorityStats = await Task.aggregate([
      { $match: { user: userId, status: { $ne: 'Completed' } } },
      { $group: { _id: '$priority', count: { $sum: 1 } } }
    ]);

    // Subject distribution
    const subjectStats = await Task.aggregate([
      { $match: { user: userId, status: { $ne: 'Completed' } } },
      { $group: { _id: '$subject', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    res.status(200).json({
      success: true,
      dashboard: {
        todaySchedule: todaySchedules,
        upcomingDeadlines: upcomingTasks,
        stressAnalytics: {
          current: stressLogs[stressLogs.length - 1]?.stressLevel || null,
          average: parseFloat(avgStress.toFixed(2)),
          trend: stressTrend,
          highStressDays: stressLogs.filter(log => log.stressLevel > 7).length
        },
        completionStats: {
          total: totalTasks,
          completed: completedTasks,
          pending: pendingTasks,
          inProgress: inProgressTasks,
          completionRate: totalTasks > 0
            ? parseFloat(((completedTasks / totalTasks) * 100).toFixed(2))
            : 0
        },
        productivity: {
          completedSessions: completedSchedules,
          missedSessions: missedSchedules,
          successRate: (completedSchedules + missedSchedules) > 0
            ? parseFloat(((completedSchedules / (completedSchedules + missedSchedules)) * 100).toFixed(2))
            : 0
        },
        priorityDistribution: priorityStats,
        subjectDistribution: subjectStats
      }
    });
  } catch (error) {
    next(error);
  }
};
