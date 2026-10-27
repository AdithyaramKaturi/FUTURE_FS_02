import React, { useState, useEffect } from 'react';
import {
  X,
  Mail,
  Phone,
  Building,
  Calendar,
  DollarSign,
  Edit2,
  Trash2,
  Plus,
  CheckCircle2,
  Clock,
  Send,
  MessageSquare,
  Sparkles
} from 'lucide-react';
import StatusBadge from './StatusBadge.jsx';
import { leadService } from '../services/leadService.js';
import { followUpService } from '../services/followUpService.js';
import { useToast } from '../context/ToastContext.jsx';
import { formatDate, formatDateTime, formatCurrency, getSourceLabel } from '../utils/formatters.js';
import FollowUpModal from './FollowUpModal.jsx';

export const LeadDetailDrawer = ({
  leadId,
  isOpen,
  onClose,
  onEditLead,
  onDeleteLead,
  onLeadUpdated
}) => {
  const { addToast } = useToast();
  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('notes'); // 'details' | 'notes' | 'followups'
  const [newNote, setNewNote] = useState('');
  const [submittingNote, setSubmittingNote] = useState(false);
  const [isFollowUpModalOpen, setIsFollowUpModalOpen] = useState(false);
  const [schedulingFollowUp, setSchedulingFollowUp] = useState(false);

  // Fetch full lead details with notes and followups
  const fetchLeadDetails = async () => {
    if (!leadId) return;
    try {
      setLoading(true);
      const res = await leadService.getLeadById(leadId);
      if (res.success) {
        setLead(res.data);
      }
    } catch (err) {
      addToast(err.message || 'Failed to load lead details', 'error');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && leadId) {
      fetchLeadDetails();
    } else {
      setLead(null);
    }
  }, [isOpen, leadId]);

  // Handle status quick change
  const handleStatusChange = async (newStatus) => {
    try {
      const res = await leadService.updateStatus(lead._id, newStatus);
      if (res.success) {
        setLead((prev) => ({ ...prev, status: newStatus }));
        addToast(`Lead status updated to ${newStatus}`, 'success');
        if (onLeadUpdated) onLeadUpdated();
      }
    } catch (err) {
      addToast(err.message || 'Failed to update status', 'error');
    }
  };

  // Handle adding a new note
  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    try {
      setSubmittingNote(true);
      const res = await leadService.addNote(lead._id, newNote.trim());
      if (res.success) {
        setLead((prev) => ({
          ...prev,
          notes: [res.data, ...(prev.notes || [])]
        }));
        setNewNote('');
        addToast('Note added successfully', 'success');
      }
    } catch (err) {
      addToast(err.message || 'Failed to add note', 'error');
    } finally {
      setSubmittingNote(false);
    }
  };

  // Handle scheduling a new follow-up
  const handleScheduleFollowUp = async (followUpData) => {
    try {
      setSchedulingFollowUp(true);
      const res = await leadService.scheduleFollowUp(lead._id, followUpData);
      if (res.success) {
        setLead((prev) => ({
          ...prev,
          followUps: [...(prev.followUps || []), res.data],
          nextFollowUpAt: res.data.scheduledAt
        }));
        setIsFollowUpModalOpen(false);
        addToast('Follow-up scheduled successfully', 'success');
        if (onLeadUpdated) onLeadUpdated();
      }
    } catch (err) {
      addToast(err.message || 'Failed to schedule follow-up', 'error');
    } finally {
      setSchedulingFollowUp(false);
    }
  };

  // Handle toggle follow-up complete
  const handleToggleFollowUp = async (followUpId, currentStatus) => {
    const isCompleted = currentStatus !== 'completed';
    try {
      const res = await followUpService.toggleComplete(followUpId, isCompleted);
      if (res.success) {
        setLead((prev) => ({
          ...prev,
          followUps: (prev.followUps || []).map((fu) =>
            fu._id === followUpId ? res.data : fu
          )
        }));
        addToast(`Follow-up marked as ${isCompleted ? 'completed' : 'pending'}`, 'info');
        if (onLeadUpdated) onLeadUpdated();
      }
    } catch (err) {
      addToast(err.message || 'Failed to update follow-up', 'error');
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="drawer-overlay" onClick={onClose} />
      <div className="drawer" role="dialog" aria-modal="true">
        {loading || !lead ? (
          <div style={{ padding: '60px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
            Loading lead details...
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="drawer-header">
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                  <h2 style={{ fontSize: '1.35rem', fontWeight: 800 }}>{lead.name}</h2>
                  <StatusBadge status={lead.status} />
                </div>
                {lead.company && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
                    <Building size={14} />
                    <span>{lead.company}</span>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => onEditLead(lead)}
                  title="Edit Lead"
                >
                  <Edit2 size={15} />
                </button>
                <button
                  type="button"
                  className="btn btn-danger btn-sm"
                  onClick={() => onDeleteLead(lead)}
                  title="Delete Lead"
                  style={{ padding: '6px 8px' }}
                >
                  <Trash2 size={15} />
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  style={{
                    padding: '6px',
                    borderRadius: '6px',
                    color: 'var(--color-text-muted)',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                  title="Close"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Quick Status Bar */}
            <div
              style={{
                padding: '12px 24px',
                backgroundColor: '#f8fafc',
                borderBottom: '1px solid var(--border-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>
                  STAGE:
                </span>
                {['new', 'contacted', 'converted', 'lost'].map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => handleStatusChange(st)}
                    style={{
                      padding: '4px 10px',
                      borderRadius: 'var(--border-radius-full)',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      textTransform: 'capitalize',
                      border: '1px solid',
                      cursor: 'pointer',
                      backgroundColor: lead.status === st ? 'var(--color-navy)' : '#ffffff',
                      color: lead.status === st ? '#ffffff' : 'var(--color-text-secondary)',
                      borderColor: lead.status === st ? 'var(--color-navy)' : 'var(--border-color)'
                    }}
                  >
                    {st}
                  </button>
                ))}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.875rem' }}>
                <DollarSign size={15} color="#10b981" />
                <strong style={{ color: 'var(--color-navy)' }}>
                  {formatCurrency(lead.value)}
                </strong>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div
              style={{
                display: 'flex',
                borderBottom: '1px solid var(--border-color)',
                padding: '0 24px',
                backgroundColor: '#ffffff'
              }}
            >
              {[
                { id: 'notes', label: `Notes (${lead.notes?.length || 0})` },
                { id: 'followups', label: `Follow-ups (${lead.followUps?.length || 0})` },
                { id: 'details', label: 'Lead Info' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    padding: '14px 16px',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: activeTab === tab.id ? 'var(--color-primary)' : 'var(--color-text-muted)',
                    borderBottom: activeTab === tab.id ? '2px solid var(--color-primary)' : '2px solid transparent',
                    cursor: 'pointer'
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Body */}
            <div className="drawer-body">
              {/* TAB 1: NOTES */}
              {activeTab === 'notes' && (
                <div>
                  {/* Add Note Form */}
                  <form onSubmit={handleAddNote} style={{ marginBottom: '24px' }}>
                    <div style={{ position: 'relative' }}>
                      <textarea
                        className="form-textarea"
                        rows={3}
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                        placeholder="Write an internal note or meeting summary..."
                        style={{ paddingRight: '48px', fontSize: '0.875rem' }}
                      />
                      <button
                        type="submit"
                        disabled={!newNote.trim() || submittingNote}
                        style={{
                          position: 'absolute',
                          right: '12px',
                          bottom: '14px',
                          backgroundColor: 'var(--color-primary)',
                          color: '#ffffff',
                          borderRadius: '6px',
                          width: '32px',
                          height: '32px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          opacity: !newNote.trim() || submittingNote ? 0.4 : 1
                        }}
                        title="Add Note"
                      >
                        <Send size={15} />
                      </button>
                    </div>
                  </form>

                  {/* Notes List */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {lead.notes && lead.notes.length > 0 ? (
                      lead.notes.map((note) => (
                        <div
                          key={note._id}
                          style={{
                            padding: '14px 16px',
                            backgroundColor: '#f8fafc',
                            borderRadius: 'var(--border-radius-md)',
                            border: '1px solid var(--border-color)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '8px'
                          }}
                        >
                          <p style={{ fontSize: '0.9rem', color: 'var(--color-text-primary)', whiteSpace: 'pre-wrap' }}>
                            {note.content}
                          </p>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                            <span style={{ fontWeight: 600, color: 'var(--color-navy-muted)' }}>
                              {note.createdBy?.name || 'Admin'}
                            </span>
                            <span>{formatDateTime(note.createdAt)}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div style={{ textAlign: 'center', padding: '36px 12px', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
                        <MessageSquare size={32} style={{ marginBottom: '8px', opacity: 0.4 }} />
                        <p>No notes logged yet. Use the field above to add the first note.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 2: FOLLOW-UPS */}
              {activeTab === 'followups' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                    <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                      Scheduled Actions
                    </span>
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      onClick={() => setIsFollowUpModalOpen(true)}
                    >
                      <Plus size={15} />
                      <span>Schedule Follow-up</span>
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {lead.followUps && lead.followUps.length > 0 ? (
                      lead.followUps.map((fu) => {
                        const isDone = fu.status === 'completed';
                        const isOverdue = !isDone && new Date(fu.scheduledAt) < new Date();

                        return (
                          <div
                            key={fu._id}
                            style={{
                              padding: '14px 16px',
                              backgroundColor: isDone ? '#f8fafc' : '#ffffff',
                              border: `1px solid ${isOverdue ? '#fca5a5' : 'var(--border-color)'}`,
                              borderRadius: 'var(--border-radius-md)',
                              display: 'flex',
                              alignItems: 'flex-start',
                              gap: '12px',
                              boxShadow: isDone ? 'none' : 'var(--shadow-sm)'
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={isDone}
                              onChange={() => handleToggleFollowUp(fu._id, fu.status)}
                              style={{
                                width: '18px',
                                height: '18px',
                                marginTop: '3px',
                                cursor: 'pointer',
                                accentColor: 'var(--color-primary)'
                              }}
                            />
                            <div style={{ flex: 1 }}>
                              <p
                                style={{
                                  fontSize: '0.9rem',
                                  fontWeight: 500,
                                  color: isDone ? 'var(--color-text-muted)' : 'var(--color-navy)',
                                  textDecoration: isDone ? 'line-through' : 'none'
                                }}
                              >
                                {fu.description}
                              </p>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '6px', fontSize: '0.775rem' }}>
                                <span style={{ color: isOverdue ? '#dc2626' : 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: isOverdue ? 600 : 400 }}>
                                  <Clock size={13} />
                                  {formatDateTime(fu.scheduledAt)} {isOverdue && '(Overdue)'}
                                </span>
                                {isDone && fu.completedAt && (
                                  <span style={{ color: '#059669' }}>
                                    Completed {formatDate(fu.completedAt)}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div style={{ textAlign: 'center', padding: '36px 12px', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
                        <Clock size={32} style={{ marginBottom: '8px', opacity: 0.4 }} />
                        <p>No follow-ups scheduled yet.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 3: DETAILS */}
              {activeTab === 'details' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: 'var(--border-radius-md)', border: '1px solid var(--border-color)' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Inquiry Message
                    </span>
                    <p style={{ marginTop: '8px', fontSize: '0.925rem', color: 'var(--color-text-primary)', whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
                      {lead.message}
                    </p>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>
                        Email
                      </span>
                      <p style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--color-navy)', marginTop: '2px', wordBreak: 'break-all' }}>
                        <a href={`mailto:${lead.email}`}>{lead.email}</a>
                      </p>
                    </div>

                    <div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>
                        Phone
                      </span>
                      <p style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--color-navy)', marginTop: '2px' }}>
                        {lead.phone ? <a href={`tel:${lead.phone}`}>{lead.phone}</a> : '—'}
                      </p>
                    </div>

                    <div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>
                        Service Requested
                      </span>
                      <p style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--color-navy)', marginTop: '2px' }}>
                        {lead.serviceInterested}
                      </p>
                    </div>

                    <div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>
                        Acquisition Source
                      </span>
                      <p style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--color-navy)', marginTop: '2px' }}>
                        {getSourceLabel(lead.source)}
                      </p>
                    </div>

                    <div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>
                        Date Created
                      </span>
                      <p style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--color-navy)', marginTop: '2px' }}>
                        {formatDateTime(lead.createdAt)}
                      </p>
                    </div>

                    <div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>
                        Last Updated
                      </span>
                      <p style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--color-navy)', marginTop: '2px' }}>
                        {formatDateTime(lead.updatedAt)}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Follow Up Modal */}
      <FollowUpModal
        isOpen={isFollowUpModalOpen}
        onClose={() => setIsFollowUpModalOpen(false)}
        onSubmit={handleScheduleFollowUp}
        leadName={lead?.name}
        isLoading={schedulingFollowUp}
      />
    </>
  );
};

export default LeadDetailDrawer;
