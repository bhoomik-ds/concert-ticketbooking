const User = require('../models/User');

// Update User Profile (Name, Mobile, City)
exports.updateUserProfile = async (req, res) => {
  try {
    const { clerkId, fullName, phoneNumber, city } = req.body;

    // Find user by Clerk ID and update their details
    const user = await User.findOneAndUpdate(
      { clerkId: clerkId },
      { 
        fullName: fullName, 
        phoneNumber: phoneNumber, 
        city: city 
      },
      { new: true, upsert: true } // Create if doesn't exist
    );

    res.json({ success: true, message: "Profile Updated", user });
  } catch (error) {
    console.error("Profile Update Error:", error);
    res.status(500).json({ success: false, message: "Failed to update profile" });
  }
};