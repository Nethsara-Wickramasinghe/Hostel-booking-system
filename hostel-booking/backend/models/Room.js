const mongoose = require('mongoose');
const roomSchema = new mongoose.Schema(
  {
    roomNumber: { type: String, required: true, unique: true, trim: true },
    roomType: { type: String, enum: ['Single', 'Double', 'Triple'], required: true },
    pricePerMonth: { type: Number, required: true, min: 0 },
    capacity: { type: Number, required: true, min: 1 },
    currentOccupancy: { type: Number, default: 0, min: 0 },
    description: { type: String, default: '', maxlength: 500 },
    image: { type: String, default: '' },
    availabilityStatus: { type: String, enum: ['Available', 'Full'], default: 'Available' },
  },
  { timestamps: true }
);
module.exports = mongoose.model('Room', roomSchema);
