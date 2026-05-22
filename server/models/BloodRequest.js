const mongoose = require('mongoose');

const bloodRequestSchema = new mongoose.Schema({
  hospital: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  hospitalName: {
    type: String,
    required: true
  },
  city: {
    type: String,
    required: true
  },
  coordinates: {
  lat: { type: Number },
  lng: { type: Number }
  },
  bloodGroup: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    required: true
  },
  units: {
    type: Number,
    required: true,
    min: 1
  },
  urgency: {
    type: String,
    enum: ['Normal', 'Urgent', 'Critical'],
    default: 'Normal'
  },
  notes: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['Open', 'Fulfilled', 'Expired', 'Cancelled'],
    default: 'Open'
  },
  acceptedDonors: [{
    donor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    donorName: String,
    donorPhone: String,
    acceptedAt: { type: Date, default: Date.now }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 24 * 60 * 60 * 1000)
  }
});

module.exports = mongoose.model('BloodRequest', bloodRequestSchema);