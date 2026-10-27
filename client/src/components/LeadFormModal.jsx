import React, { useState, useEffect } from 'react';
import Modal from './Modal.jsx';

const SERVICES = [
  'Web Development',
  'UI/UX Design',
  'Full-Stack App',
  'SEO & Marketing',
  'Consulting',
  'Other'
];

const SOURCES = [
  { value: 'website', label: 'Website Form' },
  { value: 'referral', label: 'Client Referral' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'google', label: 'Google Search' },
  { value: 'cold-outreach', label: 'Cold Outreach' },
  { value: 'other', label: 'Other' }
];

const STATUSES = [
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'converted', label: 'Converted' },
  { value: 'lost', label: 'Lost' }
];

export const LeadFormModal = ({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  isLoading = false
}) => {
  const isEdit = !!initialData?._id;

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    serviceInterested: 'Web Development',
    message: '',
    source: 'website',
    status: 'new',
    value: 0
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        email: initialData.email || '',
        phone: initialData.phone || '',
        company: initialData.company || '',
        serviceInterested: initialData.serviceInterested || 'Web Development',
        message: initialData.message || '',
        source: initialData.source || 'website',
        status: initialData.status || 'new',
        value: initialData.value || 0
      });
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        company: '',
        serviceInterested: 'Web Development',
        message: '',
        source: 'website',
        status: 'new',
        value: 0
      });
    }
    setErrors({});
  }, [initialData, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'value' ? parseFloat(value) || 0 : value
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Full name is required';
    if (!formData.email.trim()) {
      errs.email = 'Email address is required';
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      errs.email = 'Please enter a valid email address';
    }
    if (!formData.message.trim()) {
      errs.message = 'Inquiry or project details are required';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit(formData);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Edit Lead Details' : 'Create New Lead'}
      maxWidth="620px"
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
            {isLoading ? 'Saving...' : isEdit ? 'Update Lead' : 'Create Lead'}
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div className="form-group">
            <label className="form-label">Full Name *</label>
            <input
              type="text"
              name="name"
              className="form-input"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Eleanor Vance"
            />
            {errors.name && <div className="form-error">{errors.name}</div>}
          </div>

          <div className="form-group">
            <label className="form-label">Email Address *</label>
            <input
              type="email"
              name="email"
              className="form-input"
              value={formData.email}
              onChange={handleChange}
              placeholder="e.g. eleanor@example.com"
            />
            {errors.email && <div className="form-error">{errors.email}</div>}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div className="form-group">
            <label className="form-label">Company / Organization</label>
            <input
              type="text"
              name="company"
              className="form-input"
              value={formData.company}
              onChange={handleChange}
              placeholder="e.g. Acme Studio"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <input
              type="tel"
              name="phone"
              className="form-input"
              value={formData.phone}
              onChange={handleChange}
              placeholder="e.g. +1 (555) 012-3456"
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div className="form-group">
            <label className="form-label">Service Interested</label>
            <select
              name="serviceInterested"
              className="form-select"
              value={formData.serviceInterested}
              onChange={handleChange}
            >
              {SERVICES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Lead Source</label>
            <select
              name="source"
              className="form-select"
              value={formData.source}
              onChange={handleChange}
            >
              {SOURCES.map((src) => (
                <option key={src.value} value={src.value}>
                  {src.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div className="form-group">
            <label className="form-label">Status</label>
            <select
              name="status"
              className="form-select"
              value={formData.status}
              onChange={handleChange}
            >
              {STATUSES.map((st) => (
                <option key={st.value} value={st.value}>
                  {st.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Estimated Deal Value ($)</label>
            <input
              type="number"
              name="value"
              className="form-input"
              min="0"
              step="100"
              value={formData.value}
              onChange={handleChange}
              placeholder="e.g. 5000"
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Project Details / Message *</label>
          <textarea
            name="message"
            className="form-textarea"
            rows={3}
            value={formData.message}
            onChange={handleChange}
            placeholder="Describe client requirements, objectives, or context..."
          />
          {errors.message && <div className="form-error">{errors.message}</div>}
        </div>
      </form>
    </Modal>
  );
};

export default LeadFormModal;
