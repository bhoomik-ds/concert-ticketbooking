const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // This connects using the URL from your .env file
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected Successfully');
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    process.exit(1); // Stop the app if DB fails
  }
};

module.exports = connectDB;