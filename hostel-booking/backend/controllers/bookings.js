const Room = require('../models/Room');
const Booking = require('../models/Booking');
const asyncHandler = require('../utils/asyncHandler');
const HttpError = require('../utils/HttpError');
const { imageUrl } = require('../utils/image');

const ROOM_FIELDS = 'roomNumber roomType pricePerMonth image availabilityStatus';
const shape = (req, b) => {
  const o = b.toObject();
  if (o.roomId && o.roomId.image !== undefined) o.roomId.image = imageUrl(req, o.roomId.image);
  return o;
};
const ownerId = (b) => String(b.userId._id || b.userId);
const canAccess = (req, b) => req.user.role === 'admin' || ownerId(b) === String(req.user._id);

// Give a place back to the room (atomic, never below 0) and re-open it if it was Full.
const releasePlace = async (roomId) => {
  const room = await Room.findOneAndUpdate({ _id: roomId, currentOccupancy: { $gt: 0 } }, { $inc: { currentOccupancy: -1 } }, { new: true });
  if (room && room.availabilityStatus === 'Full' && room.currentOccupancy < room.capacity) {
    room.availabilityStatus = 'Available';
    await room.save();
  }
};

exports.create = asyncHandler(async (req, res) => {
  const { roomId, startDate, endDate } = req.body;
  const room = await Room.findById(roomId);
  if (!room) throw new HttpError(404, 'Room not found');
  // RULE: a full room refuses new requests
  if (room.availabilityStatus === 'Full' || room.currentOccupancy >= room.capacity) throw new HttpError(409, 'This room is full');
  // RULE: one active request per user per room
  const dup = await Booking.findOne({ userId: req.user._id, roomId, status: { $in: ['Pending', 'Approved'] } });
  if (dup) throw new HttpError(409, 'You already have an active booking for this room');
  const booking = await Booking.create({ userId: req.user._id, roomId, startDate, endDate });
  res.status(201).json(booking);
});

exports.mine = asyncHandler(async (req, res) => {
  const list = await Booking.find({ userId: req.user._id }).populate('roomId', ROOM_FIELDS).sort('-createdAt');
  res.json(list.map((b) => shape(req, b)));
});

exports.all = asyncHandler(async (req, res) => {
  const filter = req.query.status ? { status: req.query.status } : {};
  const list = await Booking.find(filter).populate('roomId', ROOM_FIELDS).populate('userId', 'name email').sort('-createdAt');
  res.json(list.map((b) => shape(req, b)));
});

exports.getOne = asyncHandler(async (req, res) => {
  const b = await Booking.findById(req.params.id).populate('roomId', ROOM_FIELDS);
  if (!b) throw new HttpError(404, 'Booking not found');
  if (!canAccess(req, b)) throw new HttpError(403, 'Not allowed');
  res.json(shape(req, b));
});

// Owner can change dates while the request is still Pending
exports.update = asyncHandler(async (req, res) => {
  const b = await Booking.findById(req.params.id);
  if (!b) throw new HttpError(404, 'Booking not found');
  if (ownerId(b) !== String(req.user._id)) throw new HttpError(403, 'Not allowed');
  if (b.status !== 'Pending') throw new HttpError(409, 'Only pending bookings can be edited');
  b.startDate = req.body.startDate;
  b.endDate = req.body.endDate;
  await b.save();
  res.json(b);
});

// Admin: Approve / Reject
exports.setStatus = asyncHandler(async (req, res) => {
  const b = await Booking.findById(req.params.id);
  if (!b) throw new HttpError(404, 'Booking not found');
  if (b.status !== 'Pending') throw new HttpError(409, `Booking is already ${b.status.toLowerCase()}`);

  if (req.body.status === 'Approved') {
    // RULE: approving takes a place. The $expr guard makes the capacity check and the
    // increment one atomic step, so two simultaneous approvals can't overbook the room.
    const room = await Room.findOneAndUpdate(
      { _id: b.roomId, $expr: { $lt: ['$currentOccupancy', '$capacity'] } },
      { $inc: { currentOccupancy: 1 } },
      { new: true }
    );
    if (!room) throw new HttpError(409, 'Room is at full capacity');
    // RULE: reaching capacity flips availabilityStatus
    if (room.currentOccupancy >= room.capacity) {
      room.availabilityStatus = 'Full';
      await room.save();
    }
  }
  b.status = req.body.status;
  await b.save();
  res.json(b);
});

// RULE: cancelling an approved booking releases the place
exports.cancel = asyncHandler(async (req, res) => {
  const b = await Booking.findById(req.params.id);
  if (!b) throw new HttpError(404, 'Booking not found');
  if (!canAccess(req, b)) throw new HttpError(403, 'Not allowed');
  if (!['Pending', 'Approved'].includes(b.status)) throw new HttpError(409, `A ${b.status.toLowerCase()} booking cannot be cancelled`);
  const wasApproved = b.status === 'Approved';
  b.status = 'Cancelled';
  await b.save();
  if (wasApproved) await releasePlace(b.roomId);
  res.json(b);
});

exports.remove = asyncHandler(async (req, res) => {
  const b = await Booking.findById(req.params.id);
  if (!b) throw new HttpError(404, 'Booking not found');
  if (!canAccess(req, b)) throw new HttpError(403, 'Not allowed');
  if (b.status === 'Approved') await releasePlace(b.roomId);
  await b.deleteOne();
  res.json({ message: 'Booking deleted' });
});
