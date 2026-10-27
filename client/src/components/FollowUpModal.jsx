import React, { useState } from 'react';
import Modal from './Modal.jsx';
import { Calendar } from 'lucide-react';

export const FollowUpModal = ({
  isOpen,
  onClose,
  onSubmit,
  leadName = '',
  isLoading = false
}) => {
  // Default to tomorrow at 10:00 AM
  const getTomorrowString = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(10, 0, 0, 0);
    return d.toISOString().slice(0, 16);
  };

  const [description, setDescription] = useState('');
  const [scheduledAt, setScheduledAt] = useState(getTomorrowString());
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!description.trim()) {
      setError('Please provide a follow-up action or note');
      return;
    }
    if (!scheduledAt) {
      setError('Please select a scheduled date and time');
      return;
    }
    setError('');
    onSubmit({
      description: description.trim(),
      scheduledAt: new Date(scheduledAt).toISOString()
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Schedule Follow-up ${leadName ? `• ${leadName}` : ''}`}
      maxWidth="500px"
      footer={
        <>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? 'Scheduling...' : 'Save Follow-up'}
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Scheduled Date & Time *</label>
          <div style={{ position: 'relative' }}>
            <input
              type="datetime-local"
              className="form-input"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Follow-up Action *</label>
          <textarea
            className="form-textarea"
            rows={3}
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
              if (error) setError('');
            }}
            placeholder="e.g. Call to discuss contract revisions, send revised project proposal..."
          />
          {error && <div className="form-error">{error}</div>}
        </div>
      </form>
    </Modal>
  );
};

export default FollowUpModal;
