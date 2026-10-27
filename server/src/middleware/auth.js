import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import { Admin } from '../models/Admin.js';

/**
 * Authentication middleware that verifies JWT from HTTP-only cookie or Bearer header
 */
export const requireAuth = async (req, res, next) => {
  try {
    let token = null;

    // 1. Check HTTP-only cookie
    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }
    // 2. Fallback to Authorization: Bearer <token> for Postman and programmatic tests
    else if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer ')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please log in.'
      });
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, config.jwtSecret);
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: 'Session invalid or expired. Please log in again.'
      });
    }

    // Find admin user
    const admin = await Admin.findById(decoded.id);
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Admin account associated with this session no longer exists.'
      });
    }

    // Attach admin to request
    req.admin = admin;
    next();
  } catch (error) {
    next(error);
  }
};
