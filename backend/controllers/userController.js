const User = require('../models/User');
const { generateDataUrl } = require('../utils/qrGenerator');
const Prescription = require('../models/Prescription');
const TestResult = require('../models/TestResult');
const jwt = require('jsonwebtoken');


exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.userId).lean();
    if (!user) return res.status(404).json({ msg: 'User not found' });

    // Use createdAt instead of uploadedAt for Prescription
    const prescriptions = await Prescription.find({ user: req.userId }).sort({ createdAt: -1 }).lean();
    const tests = await TestResult.find({ user: req.userId }).sort({ uploadedAt: -1 }).lean();

    res.json({ user, prescriptions, tests });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const updates = req.body;
    const user = await User.findByIdAndUpdate(req.userId, updates, { new: true });
    res.json({ user });
  } catch (err) {
    console.error(err);
    res.status(400).json({ msg: 'Update failed' });
  }
};

exports.getPublicRecord = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).lean();
    if (!user) return res.status(404).json({ msg: 'User not found' });

    const prescriptions = await Prescription.find({ user: req.params.userId })
      .sort({ createdAt: -1 })
      .lean();

    const tests = await TestResult.find({ user: req.params.userId })
      .sort({ uploadedAt: -1 })
      .lean();

    res.json({ user, prescriptions, tests }); // ✅ send JSON
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};



exports.getQr = async (req, res) => {
  try {
    const userId = req.params.userId;
    if (!userId) return res.status(400).json({ msg: 'User ID is required' });

    const user = await User.findById(userId).select('-password');
    if (!user) return res.status(404).json({ msg: 'User not found' });

    // Permanent link (no token expiry)
    const url = `${process.env.FRONTEND_URL}/medical-history/public/${userId}`;
    res.json({ url });

  } catch (err) {
    console.error('getQr error:', err);
    res.status(500).json({ msg: err.message });
  }
};


// exports.verifyQrToken = (req, res) => {
//   const { token } = req.body;
//   try {
//     const decoded = jwt.verify(token, process.env.QR_SECRET);
//     return res.json({ userId: decoded.userId });
//   } catch (err) {
//     return res.status(400).json({ msg: 'Invalid or expired token' });
//   }
// };

