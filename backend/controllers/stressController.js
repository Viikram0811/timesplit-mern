import StressLog from '../models/StressLog.js';

// @desc    Log stress level
// @route   POST /api/stress
// @access  Private
export const logStress = async (req, res, next) => {
  try {
    const { stressLevel, notes } = req.body;

    if (!stressLevel || stressLevel < 1 || stressLevel > 10) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid stress level (1-10)'
      });
    }

    const stressLog = await StressLog.create({
      user: req.user.id,
      stressLevel,
      notes: notes || ''
    });

    res.status(201).json({
      success: true,
      stressLog
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get stress history
// @route   GET /api/stress
// @access  Private
export const getStressHistory = async (req, res, next) => {
  try {
    const { days = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const stressLogs = await StressLog.find({
      user: req.user.id,
      date: { $gte: startDate }
    }).sort({ date: -1 });

    // Calculate statistics
    const avgStress = stressLogs.length > 0
      ? stressLogs.reduce((sum, log) => sum + log.stressLevel, 0) / stressLogs.length
      : 0;

    const recentStress = stressLogs[0]?.stressLevel || 0;

    res.status(200).json({
      success: true,
      count: stressLogs.length,
      stressLogs,
      statistics: {
        average: parseFloat(avgStress.toFixed(2)),
        recent: recentStress,
        highStressDays: stressLogs.filter(log => log.stressLevel > 7).length
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current stress level
// @route   GET /api/stress/current
// @access  Private
export const getCurrentStress = async (req, res, next) => {
  try {
    const stressLog = await StressLog.findOne({ user: req.user.id })
      .sort({ date: -1 });

    if (!stressLog) {
      return res.status(200).json({
        success: true,
        stressLevel: null,
        message: 'No stress data recorded yet'
      });
    }

    res.status(200).json({
      success: true,
      stressLevel: stressLog.stressLevel,
      stressLog
    });
  } catch (error) {
    next(error);
  }
};
