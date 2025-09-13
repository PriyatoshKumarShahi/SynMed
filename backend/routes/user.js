const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getMe, updateProfile, getPublicRecord, getQr } = require('../controllers/userController');

router.get('/me', auth, getMe);
router.put('/me', auth, updateProfile);
router.get('/public/:userId', getPublicRecord);
router.get('/qr/:userId', getQr);

module.exports = router;
