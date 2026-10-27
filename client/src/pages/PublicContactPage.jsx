import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Zap,
  Send,
  CheckCircle2,
  Lock,
  Code,
  Layout,
  Layers,
  Search,
  MessageSquare,
  ShieldCheck,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { publicService } from '../services/publicService.js';
import { useToast } from '../context/ToastContext.jsx';

const SERVICES = [
  'Web Development',
  'UI/UX Design',
  'Full-Stack App',
  'SEO & Marketing',
  'Consulting',
  'Other'
];

export const PublicContactPage = () => {
  const { addToast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    serviceInterested: 'Web Development',
    message: ''
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Your name is required';
    if (!formData.email.trim()) {
      errs.email = 'Email address is required';
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      errs.email = 'Please provide a valid email';
    }
    if (!formData.message.trim()) {
      errs.message = 'Please provide details about your project';
    } else if (formData.message.trim().length < 10) {
      errs.message = 'Message must be at least 10 characters long';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setSubmitting(true);
      const res = await publicService.submitInquiry(formData);
      if (res.success) {
        setSubmitted(true);
        addToast('Inquiry submitted successfully!', 'success');
      }
    } catch (err) {
      addToast(err.message || 'Submission failed. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      company: '',
      serviceInterested: 'Web Development',
      message: ''
    });
    setSubmitted(false);
    setErrors({});
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', display: 'flex', flexDirection: 'column' }}>
      {/* Top Public Navigation */}
      <header
        style={{
          height: '74px',
          backgroundColor: '#ffffff',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 32px'
        }}
      >
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
          <div className="logo-icon-box" style={{ width: '36px', height: '36px' }}>
            <Zap size={20} />
          </div>
          <div>
            <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-navy)', letterSpacing: '-0.02em' }}>
              LeadFlow
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'block', fontWeight: 600 }}>
              Digital Studio & Solutions
            </span>
          </div>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <a href="#services" style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginRight: '8px' }}>
            Services
          </a>
          <a href="#inquiry-form" style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginRight: '16px' }}>
            Contact Us
          </a>
          <Link to="/login" className="btn btn-secondary btn-sm" style={{ gap: '6px' }}>
            <Lock size={14} />
            <span>Admin Portal</span>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section
        style={{
          padding: '72px 24px 48px',
          textAlign: 'center',
          maxWidth: '860px',
          margin: '0 auto'
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 16px',
            backgroundColor: '#eff6ff',
            color: '#2563eb',
            borderRadius: 'var(--border-radius-full)',
            fontSize: '0.8125rem',
            fontWeight: 700,
            marginBottom: '20px',
            border: '1px solid #bfdbfe'
          }}
        >
          <Sparkles size={15} />
          Accepting New Client Projects for Q4
        </div>
        <h1
          style={{
            fontSize: '2.8rem',
            lineHeight: 1.18,
            fontWeight: 800,
            color: 'var(--color-navy)',
            marginBottom: '18px'
          }}
        >
          Transforming Ambitious Ideas Into World-Class Web Applications
        </h1>
        <p
          style={{
            fontSize: '1.15rem',
            color: 'var(--color-text-secondary)',
            lineHeight: 1.6,
            maxWidth: '680px',
            margin: '0 auto 32px'
          }}
        >
          We design and build bespoke software, dynamic websites, and cloud systems that convert visitors into lifelong clients.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
          <a href="#inquiry-form" className="btn btn-primary" style={{ padding: '12px 28px', fontSize: '1rem' }}>
            <span>Start Your Project</span>
            <ArrowRight size={18} />
          </a>
          <Link to="/dashboard" className="btn btn-secondary" style={{ padding: '12px 24px', fontSize: '1rem' }}>
            <span>View Demo CRM</span>
          </Link>
        </div>
      </section>

      {/* Capabilities Section */}
      <section id="services" style={{ padding: '48px 24px', maxWidth: '1100px', margin: '0 auto', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h2 style={{ fontSize: '1.8rem', marginBottom: '8px' }}>Our Core Services</h2>
          <p style={{ color: 'var(--color-text-muted)' }}>From prototype to enterprise-grade production software</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
          {[
            {
              icon: Code,
              title: 'Web & API Development',
              desc: 'High-performance applications built with React, Node.js, and MongoDB.'
            },
            {
              icon: Layout,
              title: 'UI/UX Product Design',
              desc: 'Modern, accessible, and intuitive interfaces optimized for maximum user conversion.'
            },
            {
              icon: Layers,
              title: 'Full-Stack Software',
              desc: 'End-to-end custom CRM, SaaS portals, dashboards, and automated business workflows.'
            }
          ].map((srv, idx) => {
            const Icon = srv.icon;
            return (
              <div key={idx} className="card" style={{ padding: '28px' }}>
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: 'var(--border-radius-md)',
                    backgroundColor: '#eff6ff',
                    color: '#2563eb',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '18px'
                  }}
                >
                  <Icon size={24} />
                </div>
                <h3 style={{ fontSize: '1.15rem', marginBottom: '8px' }}>{srv.title}</h3>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', lineHeight: '1.6' }}>
                  {srv.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Public Contact Form Section */}
      <section
        id="inquiry-form"
        style={{
          padding: '64px 24px 80px',
          maxWidth: '740px',
          margin: '0 auto',
          width: '100%'
        }}
      >
        <div className="card" style={{ padding: '40px' }}>
          {submitted ? (
            <div style={{ textAlign: 'center', padding: '32px 16px' }}>
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  backgroundColor: '#d1fae5',
                  color: '#059669',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 20px'
                }}
              >
                <CheckCircle2 size={36} />
              </div>
              <h2 style={{ fontSize: '1.6rem', marginBottom: '10px' }}>Thank You for Reaching Out!</h2>
              <p
                style={{
                  color: 'var(--color-text-secondary)',
                  fontSize: '1rem',
                  lineHeight: '1.6',
                  maxWidth: '460px',
                  margin: '0 auto 28px'
                }}
              >
                Your inquiry has been successfully captured and routed to our team's lead management system. We will contact you within 24 business hours.
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '14px' }}>
                <button type="button" className="btn btn-secondary" onClick={handleReset}>
                  Submit Another Inquiry
                </button>
                <Link to="/dashboard" className="btn btn-primary">
                  Open CRM to View This Lead
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div style={{ marginBottom: '28px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-primary)', fontWeight: 600, fontSize: '0.85rem', marginBottom: '6px' }}>
                  <MessageSquare size={16} />
                  <span>GET IN TOUCH</span>
                </div>
                <h2 style={{ fontSize: '1.75rem', marginBottom: '8px' }}>Tell Us About Your Project</h2>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.925rem' }}>
                  Fill out the form below and our team will get back to you with a comprehensive scope and estimate.
                </p>
              </div>

              <form onSubmit={handleSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px' }}>
                  <div className="form-group">
                    <label className="form-label">Full Name *</label>
                    <input
                      type="text"
                      name="name"
                      className="form-input"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="e.g. Alexander Stone"
                    />
                    {errors.name && <div className="form-error">{errors.name}</div>}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Work Email *</label>
                    <input
                      type="email"
                      name="email"
                      className="form-input"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="e.g. alexander@company.com"
                    />
                    {errors.email && <div className="form-error">{errors.email}</div>}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px' }}>
                  <div className="form-group">
                    <label className="form-label">Company Name</label>
                    <input
                      type="text"
                      name="company"
                      className="form-input"
                      value={formData.company}
                      onChange={handleChange}
                      placeholder="e.g. Apex Global"
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
                      placeholder="e.g. +1 (555) 234-5678"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Service Interested In</label>
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
                  <label className="form-label">Project Details & Objectives *</label>
                  <textarea
                    name="message"
                    className="form-textarea"
                    rows={4}
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Describe what you want to build, current challenges, desired features, and timeline..."
                  />
                  {errors.message && <div className="form-error">{errors.message}</div>}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '24px', flexWrap: 'wrap', gap: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>
                    <ShieldCheck size={16} color="#10b981" />
                    <span>Your data is securely processed and never shared.</span>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={submitting}
                    style={{ padding: '11px 24px' }}
                  >
                    <Send size={16} />
                    <span>{submitting ? 'Submitting...' : 'Send Inquiry'}</span>
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          marginTop: 'auto',
          borderTop: '1px solid var(--border-color)',
          backgroundColor: '#ffffff',
          padding: '24px 32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px'
        }}
      >
        <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
          © {new Date().getFullYear()} LeadFlow CRM. Production Full-Stack Portfolio Application.
        </div>
        <div style={{ display: 'flex', gap: '20px', fontSize: '0.875rem' }}>
          <Link to="/login" style={{ color: 'var(--color-text-secondary)', fontWeight: 600 }}>
            Admin Login
          </Link>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            GitHub
          </a>
        </div>
      </footer>
    </div>
  );
};

export default PublicContactPage;
