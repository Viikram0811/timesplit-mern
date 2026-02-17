import mongoose from 'mongoose';

const stressLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  stressLevel: {
    type: Number,
    required: [true, 'Please provide stress level'],
    min: 1,
    max: 10
  },
  notes: {
    type: String,
    trim: true,
    default: ''
  },
  date: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const StressLog = mongoose.model('StressLog', stressLogSchema);

export default StressLog;
