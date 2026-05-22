const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  createRequest,
  getDonorRequests,
  getHospitalRequests,
  acceptRequest,
  updateRequestStatus,
  getAllRequests
} = require('../controllers/requestController');

router.get('/all', getAllRequests);
router.post('/create', protect, createRequest);
router.get('/donor', protect, getDonorRequests);
router.get('/hospital', protect, getHospitalRequests);
router.put('/accept/:id', protect, acceptRequest);
router.put('/status/:id', protect, updateRequestStatus);

module.exports = router;