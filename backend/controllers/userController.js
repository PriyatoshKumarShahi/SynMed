const User = require('../models/User');
const { generateDataUrl } = require('../utils/qrGenerator');
const Prescription = require('../models/Prescription');
const TestResult = require('../models/TestResult');

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
    if (!user) return res.status(404).send('User not found');

    const prescriptions = await Prescription.find({ user: req.params.userId }).sort({ createdAt: -1 }).lean();
    const tests = await TestResult.find({ user: req.params.userId }).sort({ uploadedAt: -1 }).lean();

    res.send(`
      <html>
        <head>
          <title>${user.name}'s Profile</title>
          <style>
            body { font-family: sans-serif; padding: 2rem; background: #f9f9f9; }
            h1, h2 { color: #333; }
            .section { margin-bottom: 2rem; }
            .cards { display: flex; flex-wrap: wrap; gap: 1rem; }
            .card { background: #fff; padding: 1rem; border-radius: 8px; box-shadow: 0 2px 6px rgba(0,0,0,0.1); }
            img { max-width: 150px; border-radius: 4px; display: block; margin-bottom: 0.5rem; }
          </style>
        </head>
        <body>
          <h1>${user.name}'s Profile</h1>
          <p><strong>Email:</strong> ${user.email}</p>
          <p><strong>Phone:</strong> ${user.phone || 'N/A'}</p>

          <div class="section">
            <h2>Prescriptions</h2>
            <div class="cards">
              ${prescriptions.map(p => `
                <div class="card">
                  <img src="${p.imageUrl}" alt="Prescription"/>
                  <p>Uploaded: ${new Date(p.createdAt).toLocaleDateString()}</p>
                  <p>Doctor: ${p.doctorName || 'N/A'}</p>
                  <p>Hospital: ${p.hospitalName || 'N/A'}</p>
                </div>
              `).join('')}
            </div>
          </div>

          <div class="section">
            <h2>Test Results</h2>
            <div class="cards">
              ${tests.map(t => `
                <div class="card">
                  <img src="${t.url}" alt="Test Result"/>
                  <p>Uploaded: ${new Date(t.uploadedAt).toLocaleDateString()}</p>
                  <p>Test Name: ${t.testName || 'N/A'}</p>
                  <p>Lab: ${t.labName || 'N/A'}</p>
                </div>
              `).join('')}
            </div>
          </div>
        </body>
      </html>
    `);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

exports.getQr = async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await User.findById(userId).select('-password');
    if (!user) return res.status(404).json({ msg: 'User not found' });

    // Use FRONTEND_URL from env or fallback
    const publicProfileUrl = `${process.env.FRONTEND_URL}/medical-history/${userId}`;
    // Example: https://synmed.onrender.com/medical-history/68c1b43bcf917a123791faec

    res.json({ url: publicProfileUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};


