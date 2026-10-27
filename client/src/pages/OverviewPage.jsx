import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Users,
  Sparkles,
  PhoneCall,
  CheckCircle2,
  TrendingUp,
  Clock,
  DollarSign,
  Plus,
  ArrowUpRight,
  Inbox
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend
} from 'recharts';
import Header from '../components/Header.jsx';
import KpiCard from '../components/KpiCard.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import LeadDetailDrawer from '../components/LeadDetailDrawer.jsx';
import LeadFormModal from '../components/LeadFormModal.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import { analyticsService } from '../services/analyticsService.js';
import { leadService } from '../services/leadService.js';
import { useToast } from '../context/ToastContext.jsx';
import { formatDate, formatCurrency, getSourceLabel } from '../utils/formatters.js';

export const OverviewPage = () => {
  const { onOpenMobile } = useOutletContext();
  const { addToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState(null);
  const [trendData, setTrendData] = useState([]);
  const [statusData, setStatusData] = useState([]);
  const [sourceData, setSourceData] = useState([]);
  const [recentLeads, setRecentLeads] = useState([]);

  // Modals & Drawer State
  const [selectedLeadId, setSelectedLeadId] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState(null);
  const [deletingLead, setDeletingLead] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [kpiRes, trendRes, statusRes, sourceRes, recentRes] = await Promise.all([
        analyticsService.getOverview(),
        analyticsService.getLeadsOverTime(),
        analyticsService.getLeadsByStatus(),
        analyticsService.getLeadsBySource(),
        analyticsService.getRecentLeads()
      ]);

      if (kpiRes.success) setKpis(kpiRes.data);
      if (trendRes.success) setTrendData(trendRes.data);
      if (statusRes.success) setStatusData(statusRes.data);
      if (sourceRes.success) setSourceData(sourceRes.data);
      if (recentRes.success) setRecentLeads(recentRes.data);
    } catch (err) {
      addToast(err.message || 'Failed to fetch dashboard data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

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
        fetchDashboardData();
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
        fetchDashboardData();
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
        fetchDashboardData();
      }
    } catch (err) {
      addToast(err.message || 'Failed to delete lead', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const STATUS_COLORS = {
    new: '#3b82f6',
    contacted: '#f59e0b',
    converted: '#10b981',
    lost: '#ef4444'
  };

  return (
    <>
      <Header
        title="Dashboard Overview"
        subtitle="Monitor pipeline performance, inbound inquiries, and follow-ups"
        onOpenMobile={onOpenMobile}
        actionLabel="New Lead"
        onActionClick={() => setIsFormModalOpen(true)}
      />

      <div className="page-content">
        {loading ? (
          <LoadingSpinner text="Aggregating pipeline metrics..." />
        ) : (
          <>
            {/* KPI Cards Grid */}
            <div className="kpi-grid">
              <KpiCard
                title="Total Inquiries"
                value={kpis?.totalLeads ?? 0}
                caption="All-time registered leads"
                icon={Users}
                color="#2563eb"
                bg="#eff6ff"
              />
              <KpiCard
                title="New Inquiries"
                value={kpis?.newLeads ?? 0}
                caption="Awaiting initial outreach"
                icon={Sparkles}
                color="#0284c7"
                bg="#f0f9ff"
              />
              <KpiCard
                title="In Contact"
                value={kpis?.contactedLeads ?? 0}
                caption="Active negotiation & proposal"
                icon={PhoneCall}
                color="#d97706"
                bg="#fffbeb"
              />
              <KpiCard
                title="Converted Clients"
                value={kpis?.convertedLeads ?? 0}
                caption={`Closed won accounts`}
                icon={CheckCircle2}
                color="#059669"
                bg="#ecfdf5"
              />
              <KpiCard
                title="Conversion Rate"
                value={`${kpis?.conversionRate ?? 0}%`}
                caption="Won / Total lead ratio"
                icon={TrendingUp}
                color="#7c3aed"
                bg="#f5f3ff"
              />
              <KpiCard
                title="Follow-ups Due"
                value={kpis?.followUpsDue ?? 0}
                caption="Due today or overdue"
                icon={Clock}
                color={kpis?.followUpsDue > 0 ? '#dc2626' : '#64748b'}
                bg={kpis?.followUpsDue > 0 ? '#fef2f2' : '#f8fafc'}
              />
            </div>

            {/* Charts Row */}
            <div className="charts-grid">
              {/* Trend Chart */}
              <div className="card">
                <div className="chart-card-header">
                  <div>
                    <h3 className="chart-title">Lead Inflow Trend (Last 30 Days)</h3>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                      Inbound inquiries captured over time
                    </p>
                  </div>
                </div>
                <div style={{ width: '100%', height: 280 }}>
                  <ResponsiveContainer>
                    <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="leadsGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="displayDate" tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#ffffff',
                          borderRadius: '8px',
                          border: '1px solid #e2e8f0',
                          boxShadow: 'var(--shadow-md)',
                          fontSize: '0.85rem'
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="leads"
                        name="New Leads"
                        stroke="#2563eb"
                        strokeWidth={2.5}
                        fillOpacity={1}
                        fill="url(#leadsGradient)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Status Breakdown Donut Chart */}
              <div className="card">
                <div className="chart-card-header">
                  <div>
                    <h3 className="chart-title">Status Breakdown</h3>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                      Pipeline stage distribution
                    </p>
                  </div>
                </div>
                <div style={{ width: '100%', height: 280 }}>
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie
                        data={statusData}
                        dataKey="count"
                        nameKey="label"
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={85}
                        paddingAngle={4}
                      >
                        {statusData.map((entry) => (
                          <Cell key={entry.status} fill={STATUS_COLORS[entry.status] || '#94a3b8'} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#ffffff',
                          borderRadius: '8px',
                          border: '1px solid #e2e8f0',
                          fontSize: '0.85rem'
                        }}
                      />
                      <Legend
                        verticalAlign="bottom"
                        wrapperStyle={{ fontSize: '0.8rem', paddingTop: '10px' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Acquisition Sources Bar Chart & Recent Leads */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px', marginBottom: '24px' }}>
              {/* Acquisition Source Distribution */}
              <div className="card">
                <div className="chart-card-header">
                  <div>
                    <h3 className="chart-title">Lead Sources</h3>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                      Top acquisition channels
                    </p>
                  </div>
                </div>
                <div style={{ width: '100%', height: 260 }}>
                  <ResponsiveContainer>
                    <BarChart data={sourceData} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                      <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                      <YAxis dataKey="label" type="category" width={100} tick={{ fontSize: 11, fill: '#475569' }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#ffffff',
                          borderRadius: '8px',
                          border: '1px solid #e2e8f0',
                          fontSize: '0.85rem'
                        }}
                      />
                      <Bar dataKey="count" name="Leads" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Recent Leads Table */}
              <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
                <div
                  style={{
                    padding: '20px 24px',
                    borderBottom: '1px solid var(--border-color)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    <h3 className="chart-title">Recent Inquiries</h3>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                      Latest prospects entered into system
                    </p>
                  </div>
                </div>

                <div className="table-container">
                  <table className="lead-table">
                    <thead>
                      <tr>
                        <th>Lead</th>
                        <th>Service</th>
                        <th>Source</th>
                        <th>Status</th>
                        <th>Date</th>
                        <th>Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentLeads && recentLeads.length > 0 ? (
                        recentLeads.map((lead) => (
                          <tr key={lead._id} onClick={() => handleOpenLead(lead._id)}>
                            <td>
                              <div className="lead-primary-cell">
                                <span className="lead-name">{lead.name}</span>
                                <span className="lead-company">{lead.company || lead.email}</span>
                              </div>
                            </td>
                            <td>{lead.serviceInterested}</td>
                            <td>{getSourceLabel(lead.source)}</td>
                            <td>
                              <StatusBadge status={lead.status} />
                            </td>
                            <td>{formatDate(lead.createdAt)}</td>
                            <td>
                              <strong style={{ color: 'var(--color-navy)' }}>
                                {formatCurrency(lead.value)}
                              </strong>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} style={{ textAlign: 'center', padding: '36px', color: 'var(--color-text-muted)' }}>
                            No recent leads recorded.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
        )}
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
        onLeadUpdated={fetchDashboardData}
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

export default OverviewPage;
