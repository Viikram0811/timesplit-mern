import { useEffect, useState } from 'react';
import Layout from '../components/common/Layout';
import scheduleService from '../services/scheduleService';
import stressService from '../services/stressService';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const Schedule = () => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [currentStress, setCurrentStress] = useState(5);

  useEffect(() => {
    loadSchedules();
    loadCurrentStress();
  }, []);

  const loadSchedules = async () => {
    try {
      const response = await scheduleService.getSchedules();
      setSchedules(response.schedules);
    } catch (error) {
      toast.error('Failed to load schedules');
    } finally {
      setLoading(false);
    }
  };

  const loadCurrentStress = async () => {
    try {
      const response = await stressService.getCurrentStress();
      if (response.stressLevel) {
        setCurrentStress(response.stressLevel);
      }
    } catch (error) {
      // Ignore error
    }
  };

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      await scheduleService.generateSchedule(currentStress);
      toast.success('Schedule generated successfully');
      loadSchedules();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to generate schedule');
    } finally {
      setGenerating(false);
    }
  };

  const handleReschedule = async () => {
    try {
      await scheduleService.rescheduleMissed();
      toast.success('Missed tasks rescheduled');
      loadSchedules();
    } catch (error) {
      toast.error('Failed to reschedule');
    }
  };

  const handleComplete = async (scheduleId) => {
    try {
      await scheduleService.updateSchedule(scheduleId, 'Completed');
      toast.success('Schedule marked as completed');
      loadSchedules();
    } catch (error) {
      toast.error('Failed to update schedule');
    }
  };

  // Group schedules by date
  const groupedSchedules = schedules.reduce((acc, schedule) => {
    const date = format(new Date(schedule.scheduledDate), 'yyyy-MM-dd');
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(schedule);
    return acc;
  }, {});

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Completed': return 'badge-success';
      case 'Missed': return 'badge-error';
      case 'Scheduled': return 'badge-info';
      default: return 'badge-ghost';
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-base-content">Schedule</h1>
          <div className="flex gap-2">
            <button
              onClick={handleReschedule}
              className="btn btn-warning"
            >
              Reschedule Missed
            </button>
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="btn btn-primary"
            >
              {generating ? (
                <>
                  <span className="loading loading-spinner"></span>
                  Generating...
                </>
              ) : (
                'Generate Schedule'
              )}
            </button>
          </div>
        </div>

        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <label className="label">
              <span className="label-text font-semibold">Current Stress Level (for scheduling): {currentStress}/10</span>
            </label>
            <input
              type="range"
              min="1"
              max="10"
              value={currentStress}
              onChange={(e) => setCurrentStress(parseInt(e.target.value))}
              className="range range-primary"
            />
            <div className="w-full flex justify-between text-xs px-2">
              <span>1</span>
              <span>5</span>
              <span>10</span>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        ) : Object.keys(groupedSchedules).length === 0 ? (
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body text-center">
              <p className="text-base-content/70 mb-4">No schedule generated yet</p>
              <button
                onClick={handleGenerate}
                className="btn btn-primary"
              >
                Generate Schedule
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedSchedules)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([date, daySchedules]) => (
                <div key={date} className="card bg-base-100 shadow-xl">
                  <div className="card-body">
                    <h2 className="card-title text-2xl">
                      {format(new Date(date), 'EEEE, MMMM dd, yyyy')}
                    </h2>
                    <div className="space-y-3">
                      {daySchedules
                        .sort((a, b) => a.startTime.localeCompare(b.startTime))
                        .map((schedule) => (
                          <div
                            key={schedule._id}
                            className={`flex items-center justify-between p-4 rounded-lg ${
                              schedule.status === 'Completed'
                                ? 'bg-success/20'
                                : schedule.status === 'Missed'
                                ? 'bg-error/20'
                                : 'bg-base-200'
                            }`}
                          >
                            <div className="flex-1">
                              <div className="font-semibold text-base-content">
                                {schedule.task.title}
                              </div>
                              <div className="text-sm text-base-content/70">
                                {schedule.task.subject} • {schedule.task.priority} Priority
                              </div>
                            </div>
                            <div className="text-right mr-4">
                              <div className="font-semibold text-base-content">
                                {schedule.startTime} - {schedule.endTime}
                              </div>
                              <div className={`badge ${getStatusBadge(schedule.status)} mt-1`}>
                                {schedule.status}
                              </div>
                            </div>
                            {schedule.status === 'Scheduled' && (
                              <button
                                onClick={() => handleComplete(schedule._id)}
                                className="btn btn-sm btn-success"
                              >
                                Complete
                              </button>
                            )}
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Schedule;
