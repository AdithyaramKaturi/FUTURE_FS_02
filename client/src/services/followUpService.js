import api from './api.js';

export const followUpService = {
  getFollowUps: (params = {}) => api.get('/follow-ups', { params }),
  updateFollowUp: (id, data) => api.patch(`/follow-ups/${id}`, data),
  toggleComplete: (id, isCompleted) =>
    api.patch(`/follow-ups/${id}`, { status: isCompleted ? 'completed' : 'pending' }),
  deleteFollowUp: (id) => api.delete(`/follow-ups/${id}`)
};
