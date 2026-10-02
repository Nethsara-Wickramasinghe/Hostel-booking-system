const fs = require('fs');
const path = require('path');
const Room = require('../models/Room');
const Booking = require('../models/Booking');
const asyncHandler = require('../utils/asyncHandler');
const HttpError = require('../utils/HttpError');
const { withImage } = require('../utils/image');

const FIELDS = ['roomNumber', 'roomType', 'pricePerMonth', 'capacity', 'description'];
const removeFile = (rel) => rel && fs.unlink(path.join(__dirname, '..', rel), () => {});
const syncStatus = (room) => { room.availabilityStatus = room.currentOccupancy >= room.capacity ? 'Full' : 'Available'; };

exports.list = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.roomType) filter.roomType = req.query.roomType;
  if (req.query.availabilityStatus) filter.availabilityStatus = req.query.availabilityStatus;
  const rooms = await Room.find(filter).sort('roomNumber');
  res.json(rooms.map((r) => withImage(req, r)));
});

exports.getOne = asyncHandler(async (req, res) => {
  const room = await Room.findById(req.params.id);
  if (!room) throw new HttpError(404, 'Room not found');
  res.json(withImage(req, room));
});

exports.create = asyncHandler(async (req, res) => {
  const data = {};
  FIELDS.forEach((k) => req.body[k] !== undefined && (data[k] = req.body[k]));
  if (req.file) data.image = `/uploads/${req.file.filename}`;
  const room = await Room.create(data); // currentOccupancy is never taken from the client
  res.status(201).json(withImage(req, room));
});

exports.update = asyncHandler(async (req, res) => {
  const room = await Room.findById(req.params.id);
  if (!room) throw new HttpError(404, 'Room not found');
  FIELDS.forEach((k) => req.body[k] !== undefined && (room[k] = req.body[k]));
  if (room.capacity < room.currentOccupancy)
    throw new HttpError(409, `Capacity cannot be lower than current occupancy (${room.currentOccupancy})`);
  const oldImage = room.image;
  if (req.file) room.image = `/uploads/${req.file.filename}`;
  syncStatus(room);
  await room.save();
  if (req.file) removeFile(oldImage);
  res.json(withImage(req, room));
});

exports.remove = asyncHandler(async (req, res) => {
  const room = await Room.findById(req.params.id);
  if (!room) throw new HttpError(404, 'Room not found');
  const active = await Booking.countDocuments({ roomId: room._id, status: { $in: ['Pending', 'Approved'] } });
  if (active) throw new HttpError(409, 'Room has active bookings. Reject or cancel them first');
  await room.deleteOne();
  removeFile(room.image);
  res.json({ message: 'Room deleted' });
});
