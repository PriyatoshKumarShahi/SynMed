require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/database');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const uploadRoutes = require('./routes/upload');
const publicRoutes = require('./routes/public');


const app = express();
connectDB();

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use('/uploads', express.static(__dirname + '/uploads'));

app.use(rateLimit({ windowMs: 15*60*1000, max: 200 }));

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/public', publicRoutes);


const PORT = process.env.PORT || 5000;
app.listen(PORT, ()=> console.log(`Server running on ${PORT}`));
