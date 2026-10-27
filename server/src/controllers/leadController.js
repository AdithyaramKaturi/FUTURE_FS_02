import mongoose from 'mongoose';
import { Lead } from '../models/Lead.js';
import { Note } from '../models/Note.js';
import { FollowUp } from '../models/FollowUp.js';

/**
 * Get all leads with search, filters, sorting, and server-side pagination
 * GET /api/leads
 */
export const getLeads = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      status = 'all',
      source = 'all',
      sortBy = 'createdAt',
      sortOrder = 'desc',
      dateFrom,
      dateTo,
      hasFollowUp
    } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    // Build query filter
    const query = {};

    // Status filter
    if (status && status !== 'all') {
      query.status = status;
    }

    // Source filter
    if (source && source !== 'all') {
      query.source = source;
    }

    // Search filter across name, email, and company
    if (search && search.trim() !== '') {
      const escapedSearch = search.trim().replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
      const searchRegex = new RegExp(escapedSearch, 'i');
      query.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { company: searchRegex }
      ];
    }

    // Date range filter
    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) {
        query.createdAt.$gte = new Date(dateFrom);
      }
      if (dateTo) {
        const endOfDateTo = new Date(dateTo);
        endOfDateTo.setHours(23, 59, 59, 999);
        query.createdAt.$lte = endOfDateTo;
      }
    }

    // Follow-up state filter
    if (hasFollowUp === 'true') {
      query.nextFollowUpAt = { $ne: null };
    } else if (hasFollowUp === 'false') {
      query.nextFollowUpAt = null;
    }

    // Sort order
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Parallel fetch for data and count
    const [leads, total] = await Promise.all([
      Lead.find(query).sort(sort).skip(skip).limit(limitNum).lean(),
      Lead.countDocuments(query)
    ]);

    const totalPages = Math.ceil(total / limitNum) || 1;

    res.status(200).json({
      success: true,
      data: leads,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages,
        hasPrevPage: pageNum > 1,
        hasNextPage: pageNum < totalPages
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single lead details with recent notes and follow-ups
 * GET /api/leads/:id
 */
export const getLeadById = async (req, res, next) => {
  try {
    const { id } = req.params;

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

    // Fetch associated notes and follow-ups in parallel
    const [notes, followUps] = await Promise.all([
      Note.find({ lead: id })
        .populate('createdBy', 'name email')
        .sort({ createdAt: -1 })
        .lean(),
      FollowUp.find({ lead: id })
        .populate('createdBy', 'name email')
        .sort({ scheduledAt: 1 })
        .lean()
    ]);

    res.status(200).json({
      success: true,
      data: {
        ...lead.toJSON(),
        notes,
        followUps
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new lead manually from admin dashboard
 * POST /api/leads
 */
export const createLead = async (req, res, next) => {
  try {
    const {
      name,
      email,
      phone,
      company,
      serviceInterested,
      message,
      source = 'other',
      status = 'new',
      value = 0
    } = req.body;

    const lead = await Lead.create({
      name,
      email,
      phone: phone || '',
      company: company || '',
      serviceInterested: serviceInterested || 'Web Development',
      message: message || 'Added manually by admin',
      source,
      status,
      value: Number(value) || 0
    });

    res.status(201).json({
      success: true,
      message: 'Lead created successfully',
      data: lead
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update lead attributes
 * PATCH /api/leads/:id
 */
export const updateLead = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid lead ID format'
      });
    }

    const allowedUpdates = [
      'name',
      'email',
      'phone',
      'company',
      'serviceInterested',
      'message',
      'source',
      'status',
      'value'
    ];

    const updates = {};
    for (const key of allowedUpdates) {
      if (req.body[key] !== undefined) {
        updates[key] = req.body[key];
      }
    }

    const lead = await Lead.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true
    });

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Lead updated successfully',
      data: lead
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update only lead status
 * PATCH /api/leads/:id/status
 */
export const updateLeadStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid lead ID format'
      });
    }

    const lead = await Lead.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found'
      });
    }

    res.status(200).json({
      success: true,
      message: `Lead status updated to ${status}`,
      data: lead
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a lead and cascade delete notes and follow-ups
 * DELETE /api/leads/:id
 */
export const deleteLead = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid lead ID format'
      });
    }

    const lead = await Lead.findByIdAndDelete(id);
    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found'
      });
    }

    // Cascade delete associated notes and follow-ups
    await Promise.all([
      Note.deleteMany({ lead: id }),
      FollowUp.deleteMany({ lead: id })
    ]);

    res.status(200).json({
      success: true,
      message: 'Lead and associated records deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
