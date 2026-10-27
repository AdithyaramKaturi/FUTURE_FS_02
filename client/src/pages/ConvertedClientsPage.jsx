import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Award,
  DollarSign,
  TrendingUp,
  Building,
  Mail,
  Phone,
  Eye,
  CheckCircle2,
  Calendar
} from 'lucide-react';
import Header from '../components/Header.jsx';
import KpiCard from '../components/KpiCard.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import EmptyState from '../components/EmptyState.jsx';
import LeadDetailDrawer from '../components/LeadDetailDrawer.jsx';
import { leadService } from '../services/leadService.js';
import { useToast } from '../context/ToastContext.jsx';
import { formatDate, formatCurrency, getSourceLabel } from '../utils/formatters.js';

export const ConvertedClientsPage = () => {
  const { onOpenMobile } = useOutletContext();
  const { addToast } = useToast();

  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLeadId, setSelectedLeadId] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const fetchConvertedClients = async () => {
    try {
      setLoading(true);
      const res = await leadService.getLeads({
        status: 'converted',
        limit: 100,
        sortBy: 'value',
        sortOrder: 'desc'
      });

      if (res.success) {
        setClients(res.data);
      }
    } catch (err) {
      addToast(err.message || 'Failed to fetch converted clients', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConvertedClients();
  }, []);

  const totalWonRevenue = clients.reduce((acc, c) => acc + (c.value || 0), 0);
  const avgDealSize = clients.length > 0 ? totalWonRevenue / clients.length : 0;

  return (
    <>
      <Header
        title="Converted Clients"
        subtitle="Portfolio of closed won projects and verified revenue"
        onOpenMobile={onOpenMobile}
      />

      <div className="page-content">
        {/* KPI Banner for Converted Clients */}
        <div className="kpi-grid" style={{ marginBottom: '28px' }}>
          <KpiCard
            title="Total Won Clients"
            value={clients.length}
            caption="Closed deals converted"
            icon={Award}
            color="#059669"
            bg="#ecfdf5"
          />
          <KpiCard
            title="Total Revenue Realized"
            value={formatCurrency(totalWonRevenue)}
            caption="Sum of closed project values"
            icon={DollarSign}
            color="#2563eb"
            bg="#eff6ff"
          />
          <KpiCard
            title="Average Deal Size"
            value={formatCurrency(avgDealSize)}
            caption="Per converted client"
            icon={TrendingUp}
            color="#7c3aed"
            bg="#f5f3ff"
          />
        </div>

        {/* Clients Grid */}
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
            <h3 className="chart-title">Client Roster</h3>
            <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
              Sorted by highest project value
            </span>
          </div>

          {loading ? (
            <LoadingSpinner text="Retrieving converted clients..." />
          ) : clients.length === 0 ? (
            <EmptyState
              icon={Award}
              title="No converted clients yet"
              description="Mark qualified leads as 'Converted' in the leads pipeline to track your revenue portfolio."
            />
          ) : (
            <div className="table-container">
              <table className="lead-table">
                <thead>
                  <tr>
                    <th>Client & Organization</th>
                    <th>Service Delivered</th>
                    <th>Acquisition Source</th>
                    <th>Conversion Date</th>
                    <th>Project Value</th>
                    <th style={{ textAlign: 'right' }}>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {clients.map((client) => (
                    <tr
                      key={client._id}
                      onClick={() => {
                        setSelectedLeadId(client._id);
                        setIsDrawerOpen(true);
                      }}
                    >
                      <td>
                        <div className="lead-primary-cell">
                          <span className="lead-name" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <CheckCircle2 size={16} color="#059669" />
                            {client.name}
                          </span>
                          <span className="lead-company">
                            {client.company || client.email}
                          </span>
                        </div>
                      </td>
                      <td>{client.serviceInterested}</td>
                      <td>{getSourceLabel(client.source)}</td>
                      <td>{formatDate(client.updatedAt)}</td>
                      <td>
                        <strong style={{ color: '#059669', fontSize: '0.95rem' }}>
                          {formatCurrency(client.value)}
                        </strong>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedLeadId(client._id);
                            setIsDrawerOpen(true);
                          }}
                        >
                          <Eye size={14} />
                          <span>View History</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
        onLeadUpdated={fetchConvertedClients}
      />
    </>
  );
};

export default ConvertedClientsPage;
