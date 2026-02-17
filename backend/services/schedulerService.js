import dotenv from 'dotenv';
dotenv.config();

import Task from '../models/Task.js';
import Schedule from '../models/Schedule.js';
import User from '../models/User.js';
import StressLog from '../models/StressLog.js';
import { GoogleGenAI } from '@google/genai';

const genAI = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

// Helper function to retry with exponential backoff
const retryWithBackoff = async (fn, maxRetries = 3, baseDelay = 1000) => {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      const isRateLimit = error.status === 429 || error.code === 429 || 
                          (error.message && error.message.includes('429'));
      
      if (isRateLimit && attempt < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, attempt);
        console.log(`Rate limit hit in scheduler. Retrying in ${delay}ms... (Attempt ${attempt + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      throw error;
    }
  }
};

// Helper function to convert time string to minutes
const timeToMinutes = (timeStr) => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
};

// Helper function to convert minutes to time string
const minutesToTime = (minutes) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
};

// Helper function to check if time slot overlaps
const hasOverlap = (start1, end1, start2, end2) => {
  const s1 = timeToMinutes(start1);
  const e1 = timeToMinutes(end1);
  const s2 = timeToMinutes(start2);
  const e2 = timeToMinutes(end2);
  return (s1 < e2 && s2 < e1);
};

// Generate schedule using AI or rule-based algorithm
export const generateSchedule = async (userId, tasks, stressLevel = 5) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Filter pending and in-progress tasks
    const activeTasks = tasks.filter(
      t => t.status === 'Pending' || t.status === 'In Progress'
    );

    if (activeTasks.length === 0) {
      return { schedules: [], message: 'No active tasks to schedule' };
    }

    // Sort tasks by priority and deadline
    const sortedTasks = [...activeTasks].sort((a, b) => {
      const priorityOrder = { Critical: 4, High: 3, Medium: 2, Low: 1 };
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return new Date(a.deadline) - new Date(b.deadline);
    });

    // Adjust workload based on stress level
    const stressMultiplier = stressLevel > 7 ? 0.7 : stressLevel > 5 ? 0.85 : 1.0;
    const availableHours = user.availableHoursPerDay * stressMultiplier;

    // Use AI if API key is available, otherwise use rule-based
    if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here') {
      return await generateAISchedule(user, sortedTasks, availableHours);
    } else {
      return generateRuleBasedSchedule(user, sortedTasks, availableHours);
    }
  } catch (error) {
    throw error;
  }
};

// AI-based schedule generation
const generateAISchedule = async (user, tasks, availableHours) => {
  try {
    const tasksDescription = tasks.map((task, idx) => 
      `${idx + 1}. ${task.title} (${task.subject}) - Priority: ${task.priority}, Deadline: ${task.deadline.toISOString().split('T')[0]}, Estimated Time: ${task.estimatedTime} minutes`
    ).join('\n');

    const preferredSlots = user.preferredTimeSlots.map(slot => 
      `${slot.start} - ${slot.end}`
    ).join(', ') || 'Any time';

    const prompt = `You are an intelligent study scheduler. Create an optimal study schedule for a student.

Student Information:
- Available hours per day: ${availableHours} hours
- Preferred time slots: ${preferredSlots}
- Academic goals: ${user.academicGoals || 'Not specified'}

Tasks to schedule:
${tasksDescription}

Requirements:
1. Schedule tasks based on priority and deadline urgency
2. Respect preferred time slots when possible
3. Distribute workload evenly across days
4. Ensure no overlapping time slots
5. Break large tasks into manageable chunks if needed
6. Leave buffer time between tasks

Return a JSON array of schedules in this format:
[
  {
    "taskIndex": 0,
    "date": "YYYY-MM-DD",
    "startTime": "HH:MM",
    "endTime": "HH:MM"
  }
]

Only return the JSON array, no other text.`;

    const model = 'gemini-2.5-flash';
    const fullPrompt = `You are a helpful study scheduling assistant. Always return valid JSON arrays.\n\n${prompt}`;

    // Use retry logic for rate limit handling (non-streaming)
    const response = await retryWithBackoff(async () => {
      return await genAI.models.generateContent({
        model,
        contents: [
          {
            role: 'user',
            parts: [{ text: fullPrompt }],
          },
        ],
        generationConfig: {
          // Lower temp improves JSON reliability.
          temperature: 0.2,
          topP: 0.95,
          topK: 64,
          maxOutputTokens: 2048,
        },
      });
    });

    let responseText = (response?.text || '').trim();
    // Extract JSON from response (handle markdown code blocks)
    const jsonMatch = responseText.match(/\[[\s\S]*\]/);
    const schedules = jsonMatch ? JSON.parse(jsonMatch[0]) : [];

    // Convert AI schedules to database format
    const scheduleEntries = schedules.map(schedule => ({
      task: tasks[schedule.taskIndex]._id,
      scheduledDate: new Date(schedule.date),
      startTime: schedule.startTime,
      endTime: schedule.endTime
    }));

    return { schedules: scheduleEntries, message: 'Schedule generated using AI' };
  } catch (error) {
    console.error('AI scheduling failed, falling back to rule-based:', error);
    return generateRuleBasedSchedule(user, tasks, availableHours);
  }
};

// Rule-based schedule generation
const generateRuleBasedSchedule = (user, tasks, availableHours) => {
  const schedules = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Get preferred time slots or default to 9 AM - 9 PM
  const defaultSlots = user.preferredTimeSlots.length > 0
    ? user.preferredTimeSlots
    : [{ start: '09:00', end: '21:00' }];

  let currentDate = new Date(today);
  let taskIndex = 0;

  while (taskIndex < tasks.length) {
    const task = tasks[taskIndex];
    const daysUntilDeadline = Math.ceil(
      (new Date(task.deadline) - currentDate) / (1000 * 60 * 60 * 24)
    );

    // Calculate how many days we need for this task
    const hoursNeeded = task.estimatedTime / 60;
    const daysNeeded = Math.ceil(hoursNeeded / availableHours);

    // Start scheduling from today or deadline - daysNeeded, whichever is later
    let scheduleDate = new Date(currentDate);
    if (daysUntilDeadline < daysNeeded) {
      scheduleDate = new Date(task.deadline);
      scheduleDate.setDate(scheduleDate.getDate() - daysNeeded);
      if (scheduleDate < today) scheduleDate = new Date(today);
    }

    // Distribute task across days
    let remainingTime = task.estimatedTime;
    let dayOffset = 0;

    while (remainingTime > 0 && dayOffset < daysNeeded + 2) {
      const scheduleDay = new Date(scheduleDate);
      scheduleDay.setDate(scheduleDay.getDate() + dayOffset);

      // Skip if past deadline
      if (scheduleDay > new Date(task.deadline)) break;

      // Find available slot for this day
      for (const slot of defaultSlots) {
        if (remainingTime <= 0) break;

        const slotStart = timeToMinutes(slot.start);
        const slotEnd = timeToMinutes(slot.end);
        const slotDuration = slotEnd - slotStart;

        // Check existing schedules for this day
        const existingSchedules = schedules.filter(s => {
          const sDate = new Date(s.scheduledDate);
          return sDate.toDateString() === scheduleDay.toDateString();
        });

        // Find available time in slot
        let availableStart = slotStart;
        for (const existing of existingSchedules) {
          const existingStart = timeToMinutes(existing.startTime);
          const existingEnd = timeToMinutes(existing.endTime);
          if (hasOverlap(slot.start, slot.end, existing.startTime, existing.endTime)) {
            availableStart = Math.max(availableStart, existingEnd);
          }
        }

        const timeToSchedule = Math.min(remainingTime, slotDuration - (availableStart - slotStart));
        if (timeToSchedule > 30) { // Minimum 30 minutes
          const endTime = availableStart + timeToSchedule;
          if (endTime <= slotEnd) {
            schedules.push({
              task: task._id,
              scheduledDate: scheduleDay,
              startTime: minutesToTime(availableStart),
              endTime: minutesToTime(endTime)
            });
            remainingTime -= timeToSchedule;
          }
        }
      }
      dayOffset++;
    }

    taskIndex++;
    // Move to next day if we've scheduled enough for today
    if (schedules.filter(s => {
      const sDate = new Date(s.scheduledDate);
      return sDate.toDateString() === currentDate.toDateString();
    }).length >= availableHours * 2) { // Rough estimate
      currentDate.setDate(currentDate.getDate() + 1);
    }
  }

  return { schedules, message: 'Schedule generated using rule-based algorithm' };
};

// Reschedule missed tasks
export const rescheduleMissedTasks = async (userId) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const missedSchedules = await Schedule.find({
      user: userId,
      status: 'Scheduled',
      scheduledDate: { $lt: today }
    }).populate('task');

    if (missedSchedules.length === 0) {
      return { rescheduled: 0, message: 'No missed tasks to reschedule' };
    }

    const tasks = missedSchedules.map(s => s.task);
    const user = await User.findById(userId);

    // Get stress level (default to 5)
    const recentStress = await StressLog.findOne({ user: userId })
      .sort({ date: -1 });
    const stressLevel = recentStress ? recentStress.stressLevel : 5;

    const { schedules } = await generateSchedule(userId, tasks, stressLevel);

    // Mark old schedules as missed
    await Schedule.updateMany(
      { _id: { $in: missedSchedules.map(s => s._id) } },
      { status: 'Missed', isRescheduled: true }
    );

    // Create new schedules
    const newSchedules = schedules.map(schedule => ({
      ...schedule,
      user: userId,
      isRescheduled: true,
      rescheduledFrom: missedSchedules.find(ms => ms.task.toString() === schedule.task.toString())?.scheduledDate
    }));

    const createdSchedules = await Schedule.insertMany(newSchedules);

    return {
      rescheduled: createdSchedules.length,
      schedules: createdSchedules,
      message: `Rescheduled ${createdSchedules.length} missed tasks`
    };
  } catch (error) {
    throw error;
  }
};
