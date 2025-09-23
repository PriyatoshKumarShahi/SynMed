const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const User = require('../models/User');
const Prescription = require('../models/Prescription');
const TestResult = require('../models/TestResult');
const router = express.Router();

// Middleware to verify admin token
const verifyAdminToken = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await Admin.findById(decoded.id);
    
    if (!admin || !admin.isActive) {
      return res.status(401).json({ message: 'Invalid token or admin account deactivated.' });
    }

    req.admin = admin;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token.' });
  }
};

// Admin login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find admin by email
    const admin = await Admin.findOne({ email, isActive: true });
    if (!admin) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, admin.passwordHash);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Update last login
    admin.lastLogin = new Date();
    await admin.save();

    // Generate JWT token
    const token = jwt.sign(
      { id: admin._id, email: admin.email, role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        lastLogin: admin.lastLogin
      }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Get all patients with their medical records
router.get('/patients', verifyAdminToken, async (req, res) => {
  try {
    const { search, sortBy = 'createdAt', sortOrder = 'desc', page = 1, limit = 50 } = req.query;
    
    // Build search query
    let searchQuery = {};
    if (search) {
      searchQuery = {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ]
      };
    }

    // Get patients with pagination
    const patients = await User.find(searchQuery)
      .select('-passwordHash') // Exclude password hash
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Get medical records for each patient
    const patientsWithRecords = await Promise.all(
      patients.map(async (patient) => {
        const prescriptions = await Prescription.find({ user: patient._id })
          .sort({ createdAt: -1 });
        
        const tests = await TestResult.find({ user: patient._id })
          .sort({ uploadedAt: -1 });

        return {
          ...patient.toObject(),
          prescriptions,
          tests,
          totalRecords: prescriptions.length + tests.length
        };
      })
    );

    // Get total count for pagination
    const totalPatients = await User.countDocuments(searchQuery);

    res.json({
      success: true,
      patients: patientsWithRecords,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalPatients / limit),
        totalPatients,
        hasNext: page * limit < totalPatients,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching patients:', error);
    res.status(500).json({ message: 'Server error while fetching patients' });
  }
});

// Get specific patient details
router.get('/patients/:id', verifyAdminToken, async (req, res) => {
  try {
    const { id } = req.params;

    const patient = await User.findById(id).select('-passwordHash');
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    const prescriptions = await Prescription.find({ user: id })
      .sort({ createdAt: -1 });
    
    const tests = await TestResult.find({ user: id })
      .sort({ uploadedAt: -1 });

    res.json({
      success: true,
      patient: {
        ...patient.toObject(),
        prescriptions,
        tests
      }
    });
  } catch (error) {
    console.error('Error fetching patient details:', error);
    res.status(500).json({ message: 'Server error while fetching patient details' });
  }
});

// Get admin dashboard statistics
router.get('/stats', verifyAdminToken, async (req, res) => {
  try {
    const totalPatients = await User.countDocuments();
    const totalPrescriptions = await Prescription.countDocuments();
    const totalTests = await TestResult.countDocuments();
    
    // Get recent activities (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentPrescriptions = await Prescription.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });
    
    const recentTests = await TestResult.countDocuments({
      uploadedAt: { $gte: thirtyDaysAgo }
    });
    
    const recentPatients = await User.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });

    // Get monthly growth data
    const monthlyData = await User.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 }
    ]);

    res.json({
      success: true,
      stats: {
        totalPatients,
        totalPrescriptions,
        totalTests,
        recentActivities: recentPrescriptions + recentTests,
        recentPatients,
        recentPrescriptions,
        recentTests,
        monthlyGrowth: monthlyData
      }
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ message: 'Server error while fetching statistics' });
  }
});

// Update admin profile
router.put('/profile', verifyAdminToken, async (req, res) => {
  try {
    const { name, email, currentPassword, newPassword } = req.body;
    const admin = await Admin.findById(req.admin._id);

    // If changing password, verify current password
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ message: 'Current password is required to set new password' });
      }
      
      const isValidPassword = await bcrypt.compare(currentPassword, admin.passwordHash);
      if (!isValidPassword) {
        return res.status(401).json({ message: 'Current password is incorrect' });
      }
      
      admin.passwordHash = await bcrypt.hash(newPassword, 10);
    }

    // Update other fields
    if (name) admin.name = name;
    if (email) admin.email = email;

    await admin.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (error) {
    console.error('Error updating admin profile:', error);
    res.status(500).json({ message: 'Server error while updating profile' });
  }
});

// Delete patient record (soft delete - deactivate)
router.delete('/patients/:id', verifyAdminToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const patient = await User.findById(id);
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    // Instead of deleting, you might want to deactivate
    // For now, we'll actually delete as requested
    await User.findByIdAndDelete(id);
    await Prescription.deleteMany({ user: id });
    await TestResult.deleteMany({ user: id });

    res.json({
      success: true,
      message: 'Patient record deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting patient:', error);
    res.status(500).json({ message: 'Server error while deleting patient' });
  }
});

module.exports = router;