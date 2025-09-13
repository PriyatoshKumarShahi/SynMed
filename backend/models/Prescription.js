const mongoose = require('mongoose');

const prescriptionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  doctorName: { type: String, trim: true },  
hospitalName: { type: String, trim: true },  
 prescriptionDate: {
  type: Date,
  default: Date.now,
  required: true
}
,

  imageUrl: {
    type: String,
    required: true
  },
cloudinaryPublicId: { type: String },  

  notes: {
    type: String,
    trim: true
  },
  medicines: [{
    name: String,
    dosage: String,
    frequency: String
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Prescription', prescriptionSchema);