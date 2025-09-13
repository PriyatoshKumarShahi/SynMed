const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const { 
  uploadPrescription, 
  uploadTest, 
  uploadAvatar, 
  deletePrescription, 
  deleteTest   // ✅ add this
} = require('../controllers/uploadController');

router.post('/prescription', auth, upload.single('file'), uploadPrescription);
router.post('/test', auth, upload.single('file'), uploadTest);
router.post('/avatar', auth, upload.single('file'), uploadAvatar);

router.delete('/prescription/:id', auth, deletePrescription);
router.delete('/test/:id', auth, deleteTest);   // ✅ add this

module.exports = router;
