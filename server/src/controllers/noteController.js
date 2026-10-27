import mongoose from 'mongoose';
import { Note } from '../models/Note.js';
import { Lead } from '../models/Lead.js';

/**
 * Get all notes for a specific lead
 * GET /api/leads/:id/notes
 */
export const getLeadNotes = async (req, res, next) => {
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

    const notes = await Note.find({ lead: id })
      .populate('createdBy', 'name email role')
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      data: notes
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Add a new note to a lead
 * POST /api/leads/:id/notes
 */
export const createLeadNote = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

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

    const note = await Note.create({
      lead: id,
      content,
      createdBy: req.admin._id
    });

    const populatedNote = await Note.findById(note._id)
      .populate('createdBy', 'name email role')
      .lean();

    res.status(201).json({
      success: true,
      message: 'Note added successfully',
      data: populatedNote
    });
  } catch (error) {
    next(error);
  }
};
