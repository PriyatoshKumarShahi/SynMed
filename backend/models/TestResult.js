const mongoose = require('mongoose');

const TestSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  url: String,
  filename: String,
  uploadedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('TestResult', TestSchema);
