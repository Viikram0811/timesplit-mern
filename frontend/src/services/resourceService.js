import api from './api';

export const resourceService = {
  uploadPdf: async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/resources/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

export default resourceService;

