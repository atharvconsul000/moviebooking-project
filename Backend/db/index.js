const mongoose = require('mongoose');



const UserSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    password: String,
    role: { type: String, enum: ['user', 'admin'], default: 'user' }
});


const MovieSchema = new mongoose.Schema({
    name: String,
    time: String, 
    totalSeats: Number,
    availableSeats: Number,
    image: String, 
    houseFull: { type: Boolean, default: false }
});

const BookingSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    movieId: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie' },
    numberOfSeats: { type: Number, min: 1, max: 4 },
    bookingTime: { type: Date, default: Date.now }
});

// Create models
const User = mongoose.model('User', UserSchema);
const Movie = mongoose.model('Movie', MovieSchema);
const Booking = mongoose.model('Booking', BookingSchema);

// Export models
module.exports = {
    User,
    Movie,
    Booking
};