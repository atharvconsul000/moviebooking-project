const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { User, Movie, Booking } = require("../db/index");
const authenticateJWT = require("../middleware/auth");
const isUser = require("../middleware/user");
require("dotenv").config();

// 🔐 Signup
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "User already exists" });

    const hashed = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashed, role: "user" });
    await newUser.save();

    res.status(201).json({ message: "User registered" });
  } catch (err) {
    res.status(500).json({ message: "Signup failed", error: err.message });
  }
});

// 🔐 Signin
router.post("/signin", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ message: "Invalid password" });

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ token });
  } catch (err) {
    res.status(500).json({ message: "Signin failed", error: err.message });
  }
});

// 🎬 View all movies
router.get("/movies", authenticateJWT, isUser, async (req, res) => {
  try {
    const movies = await Movie.find();
    res.json(movies);
  } catch (err) {
    res.status(500).json({ message: "Failed to load movies" });
  }
});

// 🎟️ Book movie
router.post("/book/:movieId", authenticateJWT, isUser, async (req, res) => {
  const userId = req.user.id;
  const movieId = req.params.movieId;
  const { numberOfSeats } = req.body;

  if (numberOfSeats < 1 || numberOfSeats > 4) {
    return res.status(400).json({ message: "Can book 1 to 4 seats only" });
  }

  try {
    const movie = await Movie.findById(movieId);
    if (!movie) return res.status(404).json({ message: "Movie not found" });

    const existing = await Booking.findOne({ userId, movieId });
    if (existing) return res.status(400).json({ message: "Already booked" });

    if (movie.availableSeats < numberOfSeats) {
      return res.status(400).json({ message: "Not enough seats" });
    }

    const booking = new Booking({ userId, movieId, numberOfSeats });
    await booking.save();

    movie.availableSeats -= numberOfSeats;
    if (movie.availableSeats === 0) movie.houseFull = true;
    await movie.save();

    res.json({ message: "Booking successful" });
  } catch (err) {
    res.status(500).json({ message: "Booking failed", error: err.message });
  }
});

// ❌ Cancel booking
router.delete("/cancel/:movieId", authenticateJWT, isUser, async (req, res) => {
  const userId = req.user.id;
  const movieId = req.params.movieId;

  try {
    const booking = await Booking.findOne({ userId, movieId });
    if (!booking) return res.status(404).json({ message: "No booking found" });

    const movie = await Movie.findById(movieId);
    if (movie) {
      movie.availableSeats += booking.numberOfSeats;
      movie.houseFull = false;
      await movie.save();
    }

    await booking.deleteOne();
    res.json({ message: "Booking cancelled" });
  } catch (err) {
    res.status(500).json({ message: "Cancellation failed", error: err.message });
  }
});
// In your user routes file
router.get("/bookings/:movieId", authenticateJWT, isUser, async (req, res) => {
  const userId = req.user.id;
  const movieId = req.params.movieId;
  try {
    const existing = await Booking.findOne({ userId, movieId });
    res.json(existing);
  } catch (err) {
    res.status(500).json({ message: "Failed to load bookings", error: err.message });
  }
});

module.exports = router;
