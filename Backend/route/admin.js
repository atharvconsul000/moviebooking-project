const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { User, Movie, Booking } = require("../db/index");
const authenticateJWT = require("../middleware/auth");
const isAdmin = require("../middleware/admin");
require("dotenv").config();

// 🔐 Admin signin (no signup)
router.post("/signin", async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await User.findOne({ email, role: "admin" });
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    const valid = await bcrypt.compare(password, admin.password);
    if (!valid) return res.status(401).json({ message: "Invalid password" });

    const token = jwt.sign(
      { id: admin._id, email: admin.email, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ token });
  } catch (err) {
    res.status(500).json({ message: "Signin failed", error: err.message });
  }
});

// 🎬 Add new movie (with image URL)
router.post("/add-movie", authenticateJWT, isAdmin, async (req, res) => {
  const { name, time, totalSeats, image } = req.body;

  try {
    const movie = new Movie({
      name,
      time,
      totalSeats,
      availableSeats: totalSeats,
      image // this is now just a string URL
    });

    await movie.save();
    res.status(201).json({ message: "Movie added", movie });
  } catch (err) {
    res.status(500).json({ message: "Failed to add movie", error: err.message });
  }
});

// 🧾 Get all movies (admin view)
router.get("/movies", authenticateJWT, isAdmin, async (req, res) => {
  try {
    const movies = await Movie.find();
    res.json(movies);
  } catch (err) {
    res.status(500).json({ message: "Failed to load movies", error: err.message });
  }
});

// ❌ Delete a movie (only if no bookings exist)
router.delete("/delete-movie/:movieId", authenticateJWT, isAdmin, async (req, res) => {
  const { movieId } = req.params;

  try {
    const deletedMovie = await Movie.findByIdAndDelete(movieId);
    if (!deletedMovie) {
      return res.status(404).json({ message: "Movie not found" });
    }
   await Booking.deleteMany({movieId});
    res.json({ message: "Movie deleted successfully", movie: deletedMovie });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete movie", error: err.message });
  }
});
router.patch('/movies/:id', authenticateJWT, isAdmin, async (req, res) => {
  try {
    const updated = await Movie.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ message: "Movie updated", movie: updated });
  } catch (err) {
    res.status(500).json({ message: "Error updating movie", error: err.message });
  }
});
module.exports = router;
