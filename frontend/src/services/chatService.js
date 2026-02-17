import api from './api';

export const chatService = {
  sendMessage: async (message) => {
    const response = await api.post('/chat', { message });
    return response.data;
  },

  getChatHistory: async () => {
    const response = await api.get('/chat');
    return response.data;
  },

  clearChatHistory: async () => {
    const response = await api.delete('/chat');
    return response.data;
  }
};

export default chatService;
