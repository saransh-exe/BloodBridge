const BloodRequest = require('../models/BloodRequest');
const User = require('../models/User');
const { sendBloodRequestEmail, sendAcceptanceEmail } = require('../utils/emailService');
const { getCompatibleRecipients } = require('../utils/bloodCompatibility');
const { getCityCoordinates } = require('../utils/geocoding');

// Create blood request (Hospital only)
const createRequest = async (req, res) => {
  try {
    const { bloodGroup, units, urgency, notes } = req.body;
    const hospital = await User.findById(req.user.id);

    if (hospital.role !== 'hospital') {
      return res.status(403).json({ message: 'Only hospitals can create requests' });
    }

    const coords = getCityCoordinates(hospital.city);

const request = await BloodRequest.create({
  hospital: req.user.id,
  hospitalName: hospital.name,
  city: hospital.city,
  coordinates: coords,
  bloodGroup,
  units,
  urgency,
  notes
});
    // Find matching donors and send emails
    const { getCompatibleRecipients } = require('../utils/bloodCompatibility');
    const compatibleGroups = getCompatibleRecipients(bloodGroup);

    const matchingDonors = await User.find({
      role: 'donor',
      city: { $regex: new RegExp(hospital.city, 'i') },
      bloodGroup: { $in: compatibleGroups },
      isAvailable: true
    });

    // Send emails to all matching donors
    const emailPromises = matchingDonors.map(donor =>
      sendBloodRequestEmail(
        donor.email,
        donor.name,
        hospital.name,
        bloodGroup,
        hospital.city,
        urgency,
        request._id
      ).catch(err => console.log(`Email failed for ${donor.email}:`, err.message))
    );

    await Promise.all(emailPromises);

    res.status(201).json({
      success: true,
      request,
      notifiedDonors: matchingDonors.length
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get requests for donor (matched by blood group + city)
const getDonorRequests = async (req, res) => {
  try {
    const donor = await User.findById(req.user.id);
    const compatibleGroups = getCompatibleRecipients(donor.bloodGroup);

    const requests = await BloodRequest.find({
      city: { $regex: new RegExp(donor.city, 'i') },
      bloodGroup: { $in: compatibleGroups },
      status: 'Open'
    }).sort({ createdAt: -1 });

    res.json({ success: true, requests });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get hospital's own requests
const getHospitalRequests = async (req, res) => {
  try {
    const requests = await BloodRequest.find({
      hospital: req.user.id
    }).sort({ createdAt: -1 });

    res.json({ success: true, requests });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Accept request (Donor only)
const acceptRequest = async (req, res) => {
  try {
    const request = await BloodRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Request not found' });
    if (request.status !== 'Open') return res.status(400).json({ message: 'Request is no longer open' });

    const donor = await User.findById(req.user.id);
    const hospital = await User.findById(request.hospital);

    const alreadyAccepted = request.acceptedDonors.find(
      d => d.donor.toString() === req.user.id
    );
    if (alreadyAccepted) return res.status(400).json({ message: 'Already accepted this request' });

    request.acceptedDonors.push({
      donor: req.user.id,
      donorName: donor.name,
      donorPhone: donor.phone,
    });

    await request.save();

    // Send email to hospital
    if (hospital?.email) {
      await sendAcceptanceEmail(
        hospital.email,
        hospital.name,
        donor.name,
        donor.phone,
        request.bloodGroup
      ).catch(err => console.log('Hospital email failed:', err.message));
    }

    res.json({
      success: true,
      message: 'Request accepted successfully!',
      request
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update request status (Hospital only)
const updateRequestStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const request = await BloodRequest.findOneAndUpdate(
      { _id: req.params.id, hospital: req.user.id },
      { status },
      { new: true }
    );
    if (!request) return res.status(404).json({ message: 'Request not found' });
    res.json({ success: true, request });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all open requests (public)
const getAllRequests = async (req, res) => {
  try {
    const requests = await BloodRequest.find({ status: 'Open' })
      .sort({ createdAt: -1 })
      .limit(20);
    res.json({ success: true, requests });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createRequest,
  getDonorRequests,
  getHospitalRequests,
  acceptRequest,
  updateRequestStatus,
  getAllRequests
};