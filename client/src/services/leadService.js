import api from './api.js';

export const leadService = {
  getLeads: (params = {}) => api.get('/leads', { params }),
  getLeadById: (id) => api.get(`/leads/${id}`),
  createLead: (data) => api.post('/leads', data),
  updateLead: (id, data) => api.patch(`/leads/${id}`, data),
  updateStatus: (id, status) => api.patch(`/leads/${id}/status`, { status }),
  deleteLead: (id) => api.delete(`/leads/${id}`),

  // Lead Notes
  getNotes: (leadId) => api.get(`/leads/${leadId}/notes`),
  addNote: (leadId, content) => api.post(`/leads/${leadId}/notes`, { content }),

  // Lead Follow-Ups
  scheduleFollowUp: (leadId, data) => api.post(`/leads/${leadId}/follow-ups`, data)
};
