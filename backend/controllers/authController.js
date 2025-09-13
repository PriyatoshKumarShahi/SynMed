const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.signup = async (req, res) => {
  try {
   const {
  name, email, password, dob, phone, gender,
  address, emergencyContact, bloodGroup,
  height, weight, chronicDiseases, medicines, allergies
} = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ msg: 'name, email, password required' });
    }

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ msg: 'email exists' });

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

   const user = await User.create({
  name, email, passwordHash: hash, dob, phone, gender,
  address, emergencyContact, bloodGroup, height, weight,
  chronicDiseases, medicines, allergies
});

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

   res.json({
  token,
  user: {
    id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    gender: user.gender,
    dob: user.dob,
    bloodGroup: user.bloodGroup,
    height: user.height,
    weight: user.weight,
    address: user.address,
    emergencyContact: user.emergencyContact,
    chronicDiseases: user.chronicDiseases,
    medicines: user.medicines,
    allergies: user.allergies,
    avatar: user.avatar
  }
});
  } catch (e) {
    console.error(e);
    res.status(500).json({ msg: 'error' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: 'invalid' });
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(400).json({ msg: 'invalid' });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email }});
  } catch (e) { console.error(e); res.status(500).json({ msg: 'error' }); }
};
