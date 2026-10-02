const jwt = require('jsonwebtoken');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const HttpError = require('../utils/HttpError');

exports.protect = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || '';
  if (!header.startsWith('Bearer ')) throw new HttpError(401, 'Not authenticated');
  let payload;
  try {
    payload = jwt.verify(header.slice(7), process.env.JWT_SECRET);
  } catch {
    throw new HttpError(401, 'Session expired or invalid. Please log in again');
  }
  const user = await User.findById(payload.id);
  if (!user) throw new HttpError(401, 'Account no longer exists');
  req.user = user;
  next();
});

exports.adminOnly = (req, res, next) =>
  req.user.role === 'admin' ? next() : next(new HttpError(403, 'Admin access required'));
