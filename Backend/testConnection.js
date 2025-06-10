const mongoose = require('mongoose');

const MONGO_URI = 'mongodb+srv://atharvconsul45:Jr4Tgmiwt7FVKkEH@clusteratharv.ym3sc.mongodb.net/moviebooking';

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log("✅ Connected to MongoDB");
    process.exit(0);
  })
  .catch(err => {
    console.error("❌ Connection Error:", err);
    process.exit(1);
  });
