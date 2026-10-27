import React, { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  CalendarClock,
  Clock,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Trash2,
  Building,
  User,
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import Header from '../components/Header.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import EmptyState from '../components/EmptyState.jsx';
import LeadDetailDrawer from '../components/LeadDetailDrawer.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import { followUpService } from '../services/followUpService.js';
import { useToast } from '../context/ToastContext.jsx';
import { formatDate, formatDateTime } from '../utils/formatters.js';

const TIMEFRAME_TABS = [
  { id: 'all', label: 'All Follow-ups' },
  { id: 'today', label: 'Due Today' },
  { id: 'overdue', label: 'Overdue' },
  { id: 'upcoming', label: 'Upcoming' },
  { id: 'completed', label: 'Completed' }
];

export const FollowUpsPage = () => {
  const { onOpenMobile } = useOutletContext();
  const { addToast } = useToast();

  const [followUps, setFollowUps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('all');
  const [selectedLeadId, setSelectedLeadId] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [deletingFollowUp, setDeletingFollowUp] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchFollowUps = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (timeframe === 'completed') {
        params.status = 'completed';
      } else {
        params.timeframe = timeframe;
      }

      const res = await followUpService.getFollowUps(params);
      if (res.success) {
        setFollowUps(res.data);
      }
    } catch (err) {
      addToast(err.message || 'Failed to fetch follow-ups', 'error');
    } finally {
      setLoading(false);
    }
  }, [timeframe]);

  useEffect(() => {
    fetchFollowUps();
  }, [fetchFollowUps]);

  const handleToggleStatus = async (followUp) => {
    const isCompleted = followUp.status !== 'completed';
    try {
      const res = await followUpService.toggleComplete(followUp._id, isCompleted);
      if (res.success) {
        setFollowUps((prev) =>
          prev.map((fu) => (fu._id === followUp._id ? res.data : fu))
        );
        addToast(`Follow-up marked as ${isCompleted ? 'completed' : 'pending'}`, 'info');
      }
    } catch (err) {
      addToast(err.message || 'Failed to update follow-up', 'error');
    }
  };

  const handleDelete = async () => {
    if (!deletingFollowUp) return;
    try {
      setIsSubmitting(true);
      const res = await followUpService.deleteFollowUp(deletingFollowUp._id);
      if (res.success) {
        addToast('Follow-up deleted', 'success');
        setDeletingFollowUp(null);
        fetchFollowUps();
      }
    } catch (err) {
      addToast(err.message || 'Failed to delete follow-up', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Header
        title="Follow-ups & Tasks"
        subtitle="Track upcoming commitments, client calls, and proposal deadlines"
        onOpenMobile={onOpenMobile}
      />

      <div className="page-content">
        {/* Timeframe Filter Tabs */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '24px',
            flexWrap: 'wrap',
            gap: '12px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
            {TIMEFRAME_TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setTimeframe(tab.id)}
                style={{
                  padding: '8px 16px',
                  borderRadius: 'var(--border-radius-full)',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  backgroundColor: timeframe === tab.id ? 'var(--color-navy)' : '#ffffff',
                  color: timeframe === tab.id ? '#ffffff' : 'var(--color-text-secondary)',
                  border: `1px solid ${timeframe === tab.id ? 'var(--color-navy)' : 'var(--border-color)'}`,
                  transition: 'all var(--transition-fast)',
                  whiteSpace: 'nowrap'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={fetchFollowUps}
            title="Refresh list"
          >
            <RefreshCw size={15} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Follow-ups Content Card */}
        <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
          {loading ? (
            <LoadingSpinner text="Retrieving schedule..." />
          ) : followUps.length === 0 ? (
            <EmptyState
              icon={CalendarClock}
              title="No follow-ups for this filter"
              description="You have no pending follow-ups matching this timeframe."
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {followUps.map((fu, idx) => {
                const isDone = fu.status === 'completed';
                const isOverdue = !isDone && new Date(fu.scheduledAt) < new Date();

                return (
                  <div
                    key={fu._id}
                    style={{
                      padding: '20px 24px',
                      borderBottom: idx === followUps.length - 1 ? 'none' : '1px solid var(--border-color)',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '16px',
                      backgroundColor: isDone ? '#fafbfc' : '#ffffff',
                      transition: 'background-color var(--transition-fast)'
                    }}
                  >
                    {/* Completion Checkbox */}
                    <input
                      type="checkbox"
                      checked={isDone}
                      onChange={() => handleToggleStatus(fu)}
                      style={{
                        width: '20px',
                        height: '20px',
                        marginTop: '3px',
                        cursor: 'pointer',
                        accentColor: 'var(--color-primary)'
                      }}
                      title="Toggle completion"
                    />

                    {/* Follow-up Details */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '6px' }}>
                        <span
                          onClick={() => {
                            if (fu.lead?._id) {
                              setSelectedLeadId(fu.lead._id);
                              setIsDrawerOpen(true);
                            }
                          }}
                          style={{
                            fontSize: '0.95rem',
                            fontWeight: 700,
                            color: 'var(--color-navy)',
                            cursor: fu.lead?._id ? 'pointer' : 'default',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}
                        >
                          <User size={15} color="#3b82f6" />
                          <span>{fu.lead?.name || 'Unassigned Lead'}</span>
                          {fu.lead?.company && (
                            <span style={{ fontWeight: 400, color: 'var(--color-text-muted)' }}>
                              ({fu.lead.company})
                            </span>
                          )}
                        </span>

                        {fu.lead?.status && <StatusBadge status={fu.lead.status} />}
                      </div>

                      <p
                        style={{
                          fontSize: '0.925rem',
                          color: isDone ? 'var(--color-text-muted)' : 'var(--color-text-primary)',
                          textDecoration: isDone ? 'line-through' : 'none',
                          lineHeight: '1.5',
                          marginBottom: '8px'
                        }}
                      >
                        {fu.description}
                      </p>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '0.8rem', color: 'var(--color-text-muted)', flexWrap: 'wrap' }}>
                        <span
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontWeight: isOverdue ? 700 : 500,
                            color: isOverdue ? '#dc2626' : 'inherit'
                          }}
                        >
                          <Clock size={14} />
                          Scheduled: {formatDateTime(fu.scheduledAt)}
                          {isOverdue && ' (Overdue)'}
                        </span>

                        {isDone && fu.completedAt && (
                          <span style={{ color: '#059669', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <CheckCircle2 size={14} />
                            Completed {formatDate(fu.completedAt)}
                          </span>
                        )}

                        {fu.createdBy?.name && (
                          <span>Created by {fu.createdBy.name}</span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => {
                          if (fu.lead?._id) {
                            setSelectedLeadId(fu.lead._id);
                            setIsDrawerOpen(true);
                          }
                        }}
                        title="View Lead"
                      >
                        View Lead
                      </button>
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => setDeletingFollowUp(fu)}
                        title="Delete follow-up"
                        style={{ color: '#ef4444', padding: '6px 8px' }}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Slide-in Lead Detail Drawer */}
      <LeadDetailDrawer
        leadId={selectedLeadId}
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setSelectedLeadId(null);
        }}
        onLeadUpdated={fetchFollowUps}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deletingFollowUp}
        onClose={() => setDeletingFollowUp(null)}
        onConfirm={handleDelete}
        title="Delete Follow-up?"
        message="Are you sure you want to delete this scheduled follow-up activity?"
        confirmText="Delete"
        isLoading={isSubmitting}
      />
    </>
  );
};

export default FollowUpsPage;
