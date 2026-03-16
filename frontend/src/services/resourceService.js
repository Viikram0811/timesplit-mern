import api from './api';

export const resourceService = {
  // Get supported file types
  getSupportedTypes: async () => {
    const response = await api.get('/resources/supported-types');
    return response.data.data;
  },

  // Upload single PDF (legacy)
  uploadPdf: async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/resources/upload-single', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Upload multiple files
  uploadMultipleFiles: async (formData) => {
    const response = await api.post('/resources/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

export default resourceService;

