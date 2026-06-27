import jwt from 'jsonwebtoken';
import config from '../config/index.js';
import User from '../models/User.js';
import asyncHandler from '../utils/asyncHandler.js';

// Requires a valid Bearer token; attaches req.user.
export const protect = asyncHandler(async (req, res, next) => {
  let token;
  const header = req.headers.authorization;
  if (header && header.startsWith('Bearer ')) {
    token = header.split(' ')[1];
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorized — no token provided');
  }

  let decoded;
  try {
    decoded = jwt.verify(token, config.jwtSecret);
  } catch {
    res.status(401);
    throw new Error('Not authorized — invalid or expired token');
  }

  req.user = await User.findById(decoded.id).select('-password');
  if (!req.user) {
    res.status(401);
    throw new Error('Not authorized — user no longer exists');
  }
  next();
});

// Allows the request only if the authenticated user is an admin.
export const admin = (req, res, next) => {
  if (req.user && req.user.isAdmin) return next();
  res.status(403);
  throw new Error('Admin access only');
};

// Attaches req.user if a token is present, but never blocks the request.
export const optionalAuth = asyncHandler(async (req, _res, next) => {
  const header = req.headers.authorization;
  if (header && header.startsWith('Bearer ')) {
    try {
      const decoded = jwt.verify(header.split(' ')[1], config.jwtSecret);
      req.user = await User.findById(decoded.id).select('-password');
    } catch {
      /* ignore — treat as guest */
    }
  }
  next();
});
