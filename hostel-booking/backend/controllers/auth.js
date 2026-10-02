const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const HttpError = require('../utils/HttpError');

const sign = (user) => jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
const publicUser = (u) => ({ id: u._id, name: u.name, email: u.email, role: u.role });

exports.register = asyncHandler(async (req, res) => {
  const { name, email, password, adminCode } = req.body;
  if (await User.findOne({ email })) throw new HttpError(409, 'Email is already registered');
  let role = 'user';
  if (adminCode) {
    if (adminCode !== process.env.ADMIN_CODE) throw new HttpError(403, 'Invalid staff code');
    role = 'admin';
  }
  const user = await User.create({ name, email, password: await bcrypt.hash(password, 10), role });
  res.status(201).json({ token: sign(user), user: publicUser(user) });
});

exports.login = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email }).select('+password');
  if (!user || !(await bcrypt.compare(req.body.password, user.password))) throw new HttpError(401, 'Incorrect email or password');
  res.json({ token: sign(user), user: publicUser(user) });
});

exports.me = (req, res) => res.json({ user: publicUser(req.user) });
