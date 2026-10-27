import mongoose from 'mongoose';
import { FollowUp } from '../models/FollowUp.js';
import { Lead } from '../models/Lead.js';

/**
 * Helper to update lead.nextFollowUpAt to the earliest upcoming pending follow-up
 */
const syncLeadNextFollowUp = async (leadId) => {
  try {
    const earliestPending = await FollowUp.findOne({
      lead: leadId,
      status: 'pending'
    }).sort({ scheduledAt: 1 });

    await Lead.findByIdAndUpdate(leadId, {
      nextFollowUpAt: earliestPending ? earliestPending.scheduledAt : null
    });
  } catch (err) {
    console.error(`[FollowUp Sync Error] Failed to sync nextFollowUpAt for lead ${leadId}:`, err.message);
  }
};

/**
 * Get all follow-ups with filter tabs (all, overdue, today, upcoming, completed)
 * GET /api/follow-ups
 */
export const getFollowUps = async (req, res, next) => {
  try {
    const {
      status = 'all',
      timeframe = 'all',
      page = 1,
      limit = 20
    } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const query = {};

    // Status filter
    if (status && status !== 'all') {
      query.status = status;
    }

    // Timeframe filters
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    if (timeframe === 'overdue') {
      query.scheduledAt = { $lt: startOfToday };
      query.status = 'pending';
    } else if (timeframe === 'today') {
      query.scheduledAt = { $gte: startOfToday, $lte: endOfToday };
    } else if (timeframe === 'upcoming') {
      query.scheduledAt = { $gt: endOfToday };
      query.status = 'pending';
    }

    const [followUps, total] = await Promise.all([
      FollowUp.find(query)
        .populate('lead', 'name email company phone status')
        .populate('createdBy', 'name email')
        .sort({ scheduledAt: 1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      FollowUp.countDocuments(query)
    ]);

    const totalPages = Math.ceil(total / limitNum) || 1;

    res.status(200).json({
      success: true,
      data: followUps,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Schedule a new follow-up for a lead
 * POST /api/leads/:id/follow-ups
 */
export const createLeadFollowUp = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { description, scheduledAt } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid lead ID format'
      });
    }

    const lead = await Lead.findById(id);
    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found'
      });
    }

    const followUp = await FollowUp.create({
      lead: id,
      description,
      scheduledAt: new Date(scheduledAt),
      status: 'pending',
      createdBy: req.admin._id
    });

    // Update lead's nextFollowUpAt cache
    await syncLeadNextFollowUp(id);

    const populated = await FollowUp.findById(followUp._id)
      .populate('lead', 'name email company')
      .populate('createdBy', 'name email')
      .lean();

    res.status(201).json({
      success: true,
      message: 'Follow-up scheduled successfully',
      data: populated
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update follow-up or mark as completed/pending
 * PATCH /api/follow-ups/:id
 */
export const updateFollowUp = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid follow-up ID format'
      });
    }

    const followUp = await FollowUp.findById(id);
    if (!followUp) {
      return res.status(404).json({
        success: false,
        message: 'Follow-up not found'
      });
    }

    const { description, scheduledAt, status } = req.body;

    if (description !== undefined) {
      followUp.description = description;
    }
    if (scheduledAt !== undefined) {
      followUp.scheduledAt = new Date(scheduledAt);
    }
    if (status !== undefined) {
      followUp.status = status;
      followUp.completedAt = status === 'completed' ? new Date() : null;
    }

    await followUp.save();

    // Re-sync parent lead
    await syncLeadNextFollowUp(followUp.lead);

    const populated = await FollowUp.findById(followUp._id)
      .populate('lead', 'name email company phone status')
      .populate('createdBy', 'name email')
      .lean();

    res.status(200).json({
      success: true,
      message: `Follow-up ${status === 'completed' ? 'completed' : 'updated'} successfully`,
      data: populated
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a follow-up
 * DELETE /api/follow-ups/:id
 */
export const deleteFollowUp = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid follow-up ID format'
      });
    }

    const followUp = await FollowUp.findByIdAndDelete(id);
    if (!followUp) {
      return res.status(404).json({
        success: false,
        message: 'Follow-up not found'
      });
    }

    await syncLeadNextFollowUp(followUp.lead);

    res.status(200).json({
      success: true,
      message: 'Follow-up deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
