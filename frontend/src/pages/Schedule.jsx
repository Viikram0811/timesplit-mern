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

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Schedule</h1>
          <div className="space-x-3">
            <button
              onClick={handleReschedule}
              className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
            >
              Reschedule Missed
            </button>
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
            >
              {generating ? 'Generating...' : 'Generate Schedule'}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Current Stress Level (for scheduling): {currentStress}/10
          </label>
          <input
            type="range"
            min="1"
            max="10"
            value={currentStress}
            onChange={(e) => setCurrentStress(parseInt(e.target.value))}
            className="w-full"
          />
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : Object.keys(groupedSchedules).length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-500 mb-4">No schedule generated yet</p>
            <button
              onClick={handleGenerate}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              Generate Schedule
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedSchedules)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([date, daySchedules]) => (
                <div key={date} className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    {format(new Date(date), 'EEEE, MMMM dd, yyyy')}
                  </h2>
                  <div className="space-y-3">
                    {daySchedules
                      .sort((a, b) => a.startTime.localeCompare(b.startTime))
                      .map((schedule) => (
                        <div
                          key={schedule._id}
                          className={`flex items-center justify-between p-4 rounded-lg border ${
                            schedule.status === 'Completed'
                              ? 'bg-green-50 border-green-200'
                              : schedule.status === 'Missed'
                              ? 'bg-red-50 border-red-200'
                              : 'bg-gray-50 border-gray-200'
                          }`}
                        >
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">
                              {schedule.task.title}
                            </div>
                            <div className="text-sm text-gray-500">
                              {schedule.task.subject} • {schedule.task.priority} Priority
                            </div>
                          </div>
                          <div className="text-right mr-4">
                            <div className="font-medium text-gray-900">
                              {schedule.startTime} - {schedule.endTime}
                            </div>
                            <div className={`text-xs px-2 py-1 rounded mt-1 ${
                              schedule.status === 'Completed'
                                ? 'bg-green-100 text-green-800'
                                : schedule.status === 'Missed'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              {schedule.status}
                            </div>
                          </div>
                          {schedule.status === 'Scheduled' && (
                            <button
                              onClick={() => handleComplete(schedule._id)}
                              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                            >
                              Complete
                            </button>
                          )}
                        </div>
                      ))}
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
