import api from './api.js';

export const publicService = {
  submitInquiry: (data) => api.post('/public/leads', data)
};

export default publicService;
