const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  dob: { type: String },
  phone: { type: String },
  gender: { type: String },
  address: { type: String },
  emergencyContact: { type: String },
  bloodGroup: { type: String },
  height: { type: String, default: '' },  
  weight: { type: String, default: '' },  
  chronicDiseases: { type: String, default: '' },
  medicines: { type: String, default: '' },
  allergies: { type: String, default: '' },
  avatar: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);
