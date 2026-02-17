import api from './api';

export const scheduleService = {
  generateSchedule: async (stressLevel) => {
    const response = await api.post('/schedules/generate', { stressLevel });
    return response.data;
  },

  getSchedules: async (params = {}) => {
    const response = await api.get('/schedules', { params });
    return response.data;
  },

  updateSchedule: async (id, status) => {
    const response = await api.put(`/schedules/${id}`, { status });
    return response.data;
  },

  rescheduleMissed: async () => {
    const response = await api.post('/schedules/reschedule');
    return response.data;
  }
};

export default scheduleService;
