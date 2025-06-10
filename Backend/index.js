const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const cors = require("cors");
const adminRouter = require('./route/admin');
const userRouter = require('./route/user');

// Load environment variables
require('dotenv').config();

const app = express();
app.use(cors());

const MONGO_URI = process.env.MONGO_URI;


mongoose.connect(MONGO_URI)
  .then(() => console.log("✅ Connected"))
  .catch(err => console.log("❌ Error:", err));


// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Route definitions
app.use("/admin", adminRouter);
app.use("/user", userRouter);

// Health check / root route
app.get("/", (req, res) => {
  res.send("🎬 Movie Booking API is running!");
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
