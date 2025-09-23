require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const path = require("path");

const connectDB = require("./config/database");

const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const uploadRoutes = require("./routes/upload");
const publicRoutes = require("./routes/public");
const chatbotRoutes = require("./routes/chatbot");
const adminRoutes = require("./routes/admin"); 


const app = express();
connectDB();

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
  })
);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/public", publicRoutes);
app.use("/api/chatbot", chatbotRoutes);
app.use("/api/admin", adminRoutes);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(` Server running on port ${PORT}`));
