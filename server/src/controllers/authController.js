import jwt from 'jsonwebtoken';
import { Admin } from '../models/Admin.js';
import { config } from '../config/env.js';

/**
 * Cookie options helper
 */
const getCookieOptions = () => ({
  httpOnly: true,
  secure: config.isProduction,
  sameSite: config.isProduction ? 'none' : 'lax',
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
});

/**
 * Helper to generate JWT token
 */
const generateToken = (admin) => {
  return jwt.sign(
    { id: admin._id, role: admin.role, email: admin.email },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn }
  );
};

/**
 * Admin Login
 * POST /api/auth/login
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email }).select('+passwordHash');
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const token = generateToken(admin);

    res.cookie('token', token, getCookieOptions());

    res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      token, // Also provided for clients storing Bearer in headers or mobile/Postman
      user: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin Logout
 * POST /api/auth/logout
 */
export const logout = (req, res) => {
  res.clearCookie('token', getCookieOptions());
  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
};

/**
 * Current Authenticated Admin
 * GET /api/auth/me
 */
export const getMe = (req, res) => {
  res.status(200).json({
    success: true,
    user: {
      id: req.admin._id,
      name: req.admin.name,
      email: req.admin.email,
      role: req.admin.role,
      createdAt: req.admin.createdAt
    }
  });
};

/**
 * Update Admin Profile
 * PUT /api/auth/profile
 */
export const updateProfile = async (req, res, next) => {
  try {
    const { name, email } = req.body;
    const adminId = req.admin._id;

    // Check if new email is already taken by another admin
    if (email !== req.admin.email) {
      const existing = await Admin.findOne({ email, _id: { $ne: adminId } });
      if (existing) {
        return res.status(409).json({
          success: false,
          message: 'An account with this email already exists'
        });
      }
    }

    req.admin.name = name;
    req.admin.email = email;
    await req.admin.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: req.admin._id,
        name: req.admin.name,
        email: req.admin.email,
        role: req.admin.role
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Change Admin Password
 * PUT /api/auth/change-password
 */
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const admin = await Admin.findById(req.admin._id).select('+passwordHash');

    const isMatch = await admin.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    admin.passwordHash = await Admin.hashPassword(newPassword);
    await admin.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    next(error);
  }
};
