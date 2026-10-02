const mongoose = require('mongoose');
const bookingSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true, index: true },
    bookingDate: { type: Date, default: Date.now },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    // "Cancelled" is added so a cancelled request stays in the user's history
    status: { type: String, enum: ['Pending', 'Approved', 'Rejected', 'Cancelled'], default: 'Pending' },
  },
  { timestamps: true }
);
module.exports = mongoose.model('Booking', bookingSchema);
