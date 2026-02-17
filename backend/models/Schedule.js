import mongoose from 'mongoose';

const scheduleSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  task: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
    required: true
  },
  scheduledDate: {
    type: Date,
    required: true
  },
  startTime: {
    type: String,
    required: true
  },
  endTime: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Scheduled', 'Completed', 'Missed', 'Rescheduled'],
    default: 'Scheduled'
  },
  completedAt: {
    type: Date
  },
  isRescheduled: {
    type: Boolean,
    default: false
  },
  rescheduledFrom: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Schedule = mongoose.model('Schedule', scheduleSchema);

export default Schedule;
