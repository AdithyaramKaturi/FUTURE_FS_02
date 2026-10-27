import { Lead } from '../models/Lead.js';

/**
 * Handle public contact form submission
 * POST /api/public/leads
 */
export const submitPublicInquiry = async (req, res, next) => {
  try {
    const { name, email, phone, company, serviceInterested, message } = req.body;

    // Create new lead with default status 'new' and source 'website'
    await Lead.create({
      name,
      email,
      phone: phone || '',
      company: company || '',
      serviceInterested: serviceInterested || 'Web Development',
      message,
      source: 'website',
      status: 'new'
    });

    // Production safety: Return clear success message without exposing internal MongoDB IDs or timestamps
    res.status(201).json({
      success: true,
      message: 'Thank you! Your message has been received. Our team will review your inquiry and follow up shortly.'
    });
  } catch (error) {
    next(error);
  }
};
