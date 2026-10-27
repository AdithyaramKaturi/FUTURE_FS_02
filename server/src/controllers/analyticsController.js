import { Lead } from '../models/Lead.js';
import { FollowUp } from '../models/FollowUp.js';

/**
 * Get high-level KPI metrics for the CRM dashboard
 * GET /api/analytics/overview
 */
export const getOverview = async (req, res, next) => {
  try {
    const now = new Date();
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    // Parallel count queries for instant dashboard responsiveness
    const [
      totalLeads,
      newLeads,
      contactedLeads,
      convertedLeads,
      lostLeads,
      followUpsDue,
      valueAggregation
    ] = await Promise.all([
      Lead.countDocuments(),
      Lead.countDocuments({ status: 'new' }),
      Lead.countDocuments({ status: 'contacted' }),
      Lead.countDocuments({ status: 'converted' }),
      Lead.countDocuments({ status: 'lost' }),
      FollowUp.countDocuments({
        status: 'pending',
        scheduledAt: { $lte: endOfToday }
      }),
      Lead.aggregate([
        {
          $group: {
            _id: null,
            totalPipelineValue: {
              $sum: {
                $cond: [{ $in: ['$status', ['new', 'contacted']] }, '$value', 0]
              }
            },
            totalWonRevenue: {
              $sum: {
                $cond: [{ $eq: ['$status', 'converted'] }, '$value', 0]
              }
            }
          }
        }
      ])
    ]);

    // Conversion rate formula: (Converted Leads / Total Leads) * 100
    // Defensively handle 0 total leads to prevent division by zero
    const conversionRate = totalLeads > 0
      ? Number(((convertedLeads / totalLeads) * 100).toFixed(1))
      : 0;

    const pipelineValue = valueAggregation[0]?.totalPipelineValue || 0;
    const wonRevenue = valueAggregation[0]?.totalWonRevenue || 0;

    res.status(200).json({
      success: true,
      data: {
        totalLeads,
        newLeads,
        contactedLeads,
        convertedLeads,
        lostLeads,
        conversionRate,
        followUpsDue,
        pipelineValue,
        wonRevenue
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get leads created over time (last 30 days)
 * GET /api/analytics/leads-over-time
 */
export const getLeadsOverTime = async (req, res, next) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    thirtyDaysAgo.setHours(0, 0, 0, 0);

    const aggregated = await Lead.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          count: { $sum: 1 },
          converted: {
            $sum: { $cond: [{ $eq: ['$status', 'converted'] }, 1, 0] }
          }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // Fill in dates that had 0 leads so charts render smoothly
    const result = [];
    const dateMap = new Map(aggregated.map((item) => [item._id, item]));

    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const found = dateMap.get(dateStr);

      result.push({
        date: dateStr,
        displayDate: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        leads: found ? found.count : 0,
        converted: found ? found.converted : 0
      });
    }

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get lead count grouped by status
 * GET /api/analytics/leads-by-status
 */
export const getLeadsByStatus = async (req, res, next) => {
  try {
    const aggregated = await Lead.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const statusMap = {
      new: 0,
      contacted: 0,
      converted: 0,
      lost: 0
    };

    aggregated.forEach((item) => {
      if (statusMap[item._id] !== undefined) {
        statusMap[item._id] = item.count;
      }
    });

    const data = [
      { status: 'new', label: 'New', count: statusMap.new, color: '#3b82f6' },
      { status: 'contacted', label: 'Contacted', count: statusMap.contacted, color: '#f59e0b' },
      { status: 'converted', label: 'Converted', count: statusMap.converted, color: '#10b981' },
      { status: 'lost', label: 'Lost', count: statusMap.lost, color: '#ef4444' }
    ];

    res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get lead count grouped by source
 * GET /api/analytics/leads-by-source
 */
export const getLeadsBySource = async (req, res, next) => {
  try {
    const aggregated = await Lead.aggregate([
      {
        $group: {
          _id: '$source',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    const labelMap = {
      website: 'Website Form',
      referral: 'Client Referral',
      linkedin: 'LinkedIn',
      google: 'Google Search',
      'cold-outreach': 'Cold Outreach',
      other: 'Other'
    };

    const data = aggregated.map((item) => ({
      source: item._id,
      label: labelMap[item._id] || item._id,
      count: item.count
    }));

    res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get recent leads for overview dashboard
 * GET /api/analytics/recent-leads
 */
export const getRecentLeads = async (req, res, next) => {
  try {
    const recentLeads = await Lead.find()
      .sort({ createdAt: -1 })
      .limit(6)
      .lean();

    res.status(200).json({
      success: true,
      data: recentLeads
    });
  } catch (error) {
    next(error);
  }
};
