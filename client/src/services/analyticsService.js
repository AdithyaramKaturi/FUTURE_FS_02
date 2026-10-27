import api from './api.js';

export const analyticsService = {
  getOverview: () => api.get('/analytics/overview'),
  getLeadsOverTime: () => api.get('/analytics/leads-over-time'),
  getLeadsByStatus: () => api.get('/analytics/leads-by-status'),
  getLeadsBySource: () => api.get('/analytics/leads-by-source'),
  getRecentLeads: () => api.get('/analytics/recent-leads'),
  clearAllData: () => api.post('/seed/clear'),
  resetDemoData: () => api.post('/seed/demo')
};

export const publicService = {
  submitInquiry: (data) => api.post('/public/leads', data)
};
