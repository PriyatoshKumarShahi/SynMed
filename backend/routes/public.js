// routes/public.js
const express = require('express');
const router = express.Router();
const User = require('../models/User'); // adjust path to your User model

// GET /api/public/:id
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('prescriptions')
      .populate('tests');

    if (!user) {
      return res.status(404).json({ message: 'Record not found' });
    }

    res.json({
      prescriptions: user.prescriptions,
      tests: user.tests
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
