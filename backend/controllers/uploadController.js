const cloudinary = require('../config/cloudinary');
const Prescription = require('../models/Prescription');
const TestResult = require('../models/TestResult');
const User = require('../models/User');
const fs = require('fs');

async function uploadToCloudOrLocal(filePath) {
  if (process.env.CLOUDINARY_CLOUD_NAME) {
    const result = await cloudinary.uploader.upload(filePath, { folder: 'synmed' });
    try { fs.unlinkSync(filePath); } catch(e){}
    return { 
      url: result.secure_url, 
      filename: result.original_filename, 
      public_id: result.public_id   // ✅ add this
    };
  } else {
    return { 
      url: `/uploads/${filePath.split('/').pop()}`, 
      filename: filePath.split('/').pop(), 
      public_id: null 
    };
  }
}


exports.uploadPrescription = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ msg: 'no file' });

    const upl = await uploadToCloudOrLocal(req.file.path);

    const p = await Prescription.create({
      user: req.userId,
      imageUrl: upl.url,                   // ✅ save URL correctly
      prescriptionDate: req.body.prescriptionDate || new Date(), // ✅ fix invalid date
      doctorName: req.body.doctorName || "Unknown",
      hospitalName: req.body.hospitalName || "Unknown",
      cloudinaryPublicId: upl.public_id || null
    });

    res.json(p);
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};


// const cloudinary = require('../config/cloudinary'); // make sure you import your cloudinary config
// const Prescription = require('../models/Prescription');

exports.deletePrescription = async (req, res) => {
  try {
    // Find the prescription for this user
    const pres = await Prescription.findOne({ _id: req.params.id, user: req.userId });
    if (!pres) return res.status(404).json({ msg: 'Not found' });

    // Delete from Cloudinary (only if publicId exists)
    if (pres.cloudinaryPublicId) {
      await cloudinary.uploader.destroy(pres.cloudinaryPublicId);
    }

    // Delete from DB
    await Prescription.findByIdAndDelete(pres._id);

    res.json({ msg: 'Deleted successfully' });
  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.deleteTest = async (req, res) => {
  try {
    const test = await TestResult.findOne({ _id: req.params.id, user: req.userId });
    if (!test) return res.status(404).json({ msg: 'Not found' });

    // Delete from Cloudinary if exists
    if (test.cloudinaryPublicId) {
      await cloudinary.uploader.destroy(test.cloudinaryPublicId);
    }

    await TestResult.findByIdAndDelete(test._id);

    res.json({ msg: 'Deleted successfully' });
  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};



exports.uploadTest = async (req, res) => {
  if (!req.file) return res.status(400).json({ msg: 'no file' });
  const upl = await uploadToCloudOrLocal(req.file.path);
  const t = await TestResult.create({ user: req.userId, url: upl.url, filename: req.file.originalname });
  res.json(t);
};

exports.uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ msg: "No file uploaded" });
    }

    const upl = await uploadToCloudOrLocal(req.file.path);

    const user = await User.findByIdAndUpdate(
      req.userId,
      { avatar: upl.url },
      { new: true }
    );

    res.json({ avatar: user.avatar, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};
