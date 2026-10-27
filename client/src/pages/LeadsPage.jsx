import React, { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Search,
  Filter,
  Plus,
  Eye,
  Edit2,
  Trash2,
  Calendar,
  Clock,
  ArrowUpDown,
  RefreshCw,
  Mail,
  Phone
} from 'lucide-react';
import Header from '../components/Header.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import Pagination from '../components/Pagination.jsx';
import EmptyState from '../components/EmptyState.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import LeadDetailDrawer from '../components/LeadDetailDrawer.jsx';
import LeadFormModal from '../components/LeadFormModal.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import { leadService } from '../services/leadService.js';
import { useToast } from '../context/ToastContext.jsx';
import { formatDate, formatDateTime, formatCurrency, getSourceLabel } from '../utils/formatters.js';

const STATUS_TABS = [
  { id: 'all', label: 'All Leads' },
  { id: 'new', label: 'New' },
  { id: 'contacted', label: 'Contacted' },
  { id: 'converted', label: 'Converted' },
  { id: 'lost', label: 'Lost' }
];

export const LeadsPage = () => {
  const { onOpenMobile } = useOutletContext();
  const { addToast } = useToast();

  const [leads, setLeads] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  // Modals & Drawer State
  const [selectedLeadId, setSelectedLeadId] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState(null);
  const [deletingLead, setDeletingLead] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPagination((prev) => ({ ...prev, page: 1 }));
    }, 350);
    return () => clearTimeout(timer);
  }, [search]);

  // Fetch leads with server-side queries
  const fetchLeads = useCallback(async () => {
    try {
      setLoading(true);
      const res = await leadService.getLeads({
        page: pagination.page,
        limit: pagination.limit,
        search: debouncedSearch,
        status: statusFilter,
        source: sourceFilter,
        sortBy,
        sortOrder
      });

      if (res.success) {
        setLeads(res.data);
        setPagination(res.pagination);
      }
    } catch (err) {
      addToast(err.message || 'Failed to fetch leads', 'error');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, debouncedSearch, statusFilter, sourceFilter, sortBy, sortOrder]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  const handleOpenLead = (id) => {
    setSelectedLeadId(id);
    setIsDrawerOpen(true);
  };

  const handleCreateLead = async (formData) => {
    try {
      setIsSubmitting(true);
      const res = await leadService.createLead(formData);
      if (res.success) {
        addToast('Lead created successfully', 'success');
        setIsFormModalOpen(false);
        fetchLeads();
      }
    } catch (err) {
      addToast(err.message || 'Failed to create lead', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateLead = async (formData) => {
    try {
      setIsSubmitting(true);
      const res = await leadService.updateLead(editingLead._id, formData);
      if (res.success) {
        addToast('Lead updated successfully', 'success');
        setEditingLead(null);
        fetchLeads();
      }
    } catch (err) {
      addToast(err.message || 'Failed to update lead', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteLead = async () => {
    if (!deletingLead) return;
    try {
      setIsSubmitting(true);
      const res = await leadService.deleteLead(deletingLead._id);
      if (res.success) {
        addToast('Lead deleted successfully', 'success');
        setDeletingLead(null);
        setIsDrawerOpen(false);
        fetchLeads();
      }
    } catch (err) {
      addToast(err.message || 'Failed to delete lead', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Header
        title="Lead Management"
        subtitle="Search, filter, track and convert prospective clients"
        onOpenMobile={onOpenMobile}
        actionLabel="Create Lead"
        onActionClick={() => setIsFormModalOpen(true)}
      />

      <div className="page-content">
        {/* Status Filter Tabs */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '20px',
            overflowX: 'auto',
            paddingBottom: '4px'
          }}
        >
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setStatusFilter(tab.id);
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
              style={{
                padding: '8px 16px',
                borderRadius: 'var(--border-radius-full)',
                fontSize: '0.875rem',
                fontWeight: 600,
                cursor: 'pointer',
                backgroundColor: statusFilter === tab.id ? 'var(--color-navy)' : '#ffffff',
                color: statusFilter === tab.id ? '#ffffff' : 'var(--color-text-secondary)',
                border: `1px solid ${statusFilter === tab.id ? 'var(--color-navy)' : 'var(--border-color)'}`,
                transition: 'all var(--transition-fast)',
                whiteSpace: 'nowrap'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Toolbar: Search, Source Filter & Sorting */}
        <div className="card" style={{ padding: '16px 20px', marginBottom: '20px' }}>
          <div className="toolbar" style={{ margin: 0 }}>
            {/* Search Input */}
            <div className="search-input-wrapper">
              <Search size={18} className="search-icon" />
              <input
                type="text"
                className="search-input"
                placeholder="Search leads by name, email, company..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* Filter Dropdowns */}
            <div className="filter-group">
              <select
                className="filter-select"
                value={sourceFilter}
                onChange={(e) => {
                  setSourceFilter(e.target.value);
                  setPagination((prev) => ({ ...prev, page: 1 }));
                }}
              >
                <option value="all">All Sources</option>
                <option value="website">Website Form</option>
                <option value="referral">Referral</option>
                <option value="linkedin">LinkedIn</option>
                <option value="google">Google</option>
                <option value="cold-outreach">Cold Outreach</option>
                <option value="other">Other</option>
              </select>

              <select
                className="filter-select"
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [by, order] = e.target.value.split('-');
                  setSortBy(by);
                  setSortOrder(order);
                  setPagination((prev) => ({ ...prev, page: 1 }));
                }}
              >
                <option value="createdAt-desc">Newest First</option>
                <option value="createdAt-asc">Oldest First</option>
                <option value="name-asc">Name (A-Z)</option>
                <option value="name-desc">Name (Z-A)</option>
                <option value="value-desc">Highest Value</option>
                <option value="value-asc">Lowest Value</option>
              </select>

              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={fetchLeads}
                title="Refresh leads list"
              >
                <RefreshCw size={15} />
              </button>
            </div>
          </div>
        </div>

        {/* Master Leads Table */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {loading ? (
            <LoadingSpinner text="Retrieving leads from database..." />
          ) : leads.length === 0 ? (
            <EmptyState
              title="No matching leads found"
              description="Try clearing your search or status filters, or add a new lead manually."
              actionLabel="Create Lead"
              onAction={() => setIsFormModalOpen(true)}
            />
          ) : (
            <>
              <div className="table-container">
                <table className="lead-table">
                  <thead>
                    <tr>
                      <th>Lead Contact</th>
                      <th>Service</th>
                      <th>Source</th>
                      <th>Status</th>
                      <th>Next Follow-up</th>
                      <th>Created</th>
                      <th>Value</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leads.map((lead) => {
                      const hasFollowUp = !!lead.nextFollowUpAt;
                      const isFollowUpOverdue =
                        hasFollowUp && new Date(lead.nextFollowUpAt) < new Date();

                      return (
                        <tr key={lead._id} onClick={() => handleOpenLead(lead._id)}>
                          <td>
                            <div className="lead-primary-cell">
                              <span className="lead-name">{lead.name}</span>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                                <span className="lead-company">
                                  {lead.company ? `${lead.company} • ` : ''}
                                  {lead.email}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span style={{ fontSize: '0.85rem', color: 'var(--color-navy-muted)' }}>
                              {lead.serviceInterested}
                            </span>
                          </td>
                          <td>
                            <span style={{ fontSize: '0.8125rem' }}>
                              {getSourceLabel(lead.source)}
                            </span>
                          </td>
                          <td>
                            <StatusBadge status={lead.status} />
                          </td>
                          <td>
                            {hasFollowUp ? (
                              <span
                                style={{
                                  fontSize: '0.8125rem',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  color: isFollowUpOverdue ? '#dc2626' : 'var(--color-text-secondary)',
                                  fontWeight: isFollowUpOverdue ? 600 : 400
                                }}
                              >
                                <Clock size={13} />
                                {formatDate(lead.nextFollowUpAt)}
                              </span>
                            ) : (
                              <span style={{ color: 'var(--color-text-subtle)', fontSize: '0.8125rem' }}>
                                None scheduled
                              </span>
                            )}
                          </td>
                          <td>
                            <span style={{ fontSize: '0.8125rem' }}>
                              {formatDate(lead.createdAt)}
                            </span>
                          </td>
                          <td>
                            <strong style={{ color: 'var(--color-navy)', fontSize: '0.9rem' }}>
                              {formatCurrency(lead.value)}
                            </strong>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <div
                              style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                type="button"
                                className="btn btn-secondary btn-sm"
                                onClick={() => handleOpenLead(lead._id)}
                                title="View Details"
                                style={{ padding: '6px 8px' }}
                              >
                                <Eye size={14} />
                              </button>
                              <button
                                type="button"
                                className="btn btn-secondary btn-sm"
                                onClick={() => setEditingLead(lead)}
                                title="Edit Lead"
                                style={{ padding: '6px 8px' }}
                              >
                                <Edit2 size={14} />
                              </button>
                              <button
                                type="button"
                                className="btn btn-secondary btn-sm"
                                onClick={() => setDeletingLead(lead)}
                                title="Delete Lead"
                                style={{ padding: '6px 8px', color: '#ef4444' }}
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Server-side Pagination Component */}
              <Pagination pagination={pagination} onPageChange={handlePageChange} />
            </>
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
        onEditLead={(lead) => {
          setEditingLead(lead);
          setIsDrawerOpen(false);
        }}
        onDeleteLead={(lead) => {
          setDeletingLead(lead);
        }}
        onLeadUpdated={fetchLeads}
      />

      {/* Create Lead Modal */}
      <LeadFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSubmit={handleCreateLead}
        isLoading={isSubmitting}
      />

      {/* Edit Lead Modal */}
      <LeadFormModal
        isOpen={!!editingLead}
        initialData={editingLead}
        onClose={() => setEditingLead(null)}
        onSubmit={handleUpdateLead}
        isLoading={isSubmitting}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deletingLead}
        onClose={() => setDeletingLead(null)}
        onConfirm={handleDeleteLead}
        title="Delete Lead?"
        message={`Are you sure you want to delete "${deletingLead?.name}"? All associated notes and follow-ups will also be permanently deleted.`}
        confirmText="Delete Lead"
        isLoading={isSubmitting}
      />
    </>
  );
};

export default LeadsPage;
