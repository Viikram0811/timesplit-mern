import api from './api';

export const stressService = {
  logStress: async (stressData) => {
    const response = await api.post('/stress', stressData);
    return response.data;
  },

  getStressHistory: async (days = 30) => {
    const response = await api.get('/stress', { params: { days } });
    return response.data;
  },

  getCurrentStress: async () => {
    const response = await api.get('/stress/current');
    return response.data;
  }
};

export default stressService;
