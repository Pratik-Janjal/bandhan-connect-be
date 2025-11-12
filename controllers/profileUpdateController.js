import User from "../models/User.js";

// ✅ POST /api/profile/update
export const updateUserProfile = async (req, res) => {
  try {
    const { userId, name, age, location, education, profession, religion, bio, interests, photos } = req.body;

    // 🧩 1. Validate User ID
    if (!userId) {
      return res.status(400).json({ success: false, message: "User ID is required" });
    }

    // 🧩 2. Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // 🧩 3. Validate each field before updating
    if (name && typeof name !== "string") {
      return res.status(400).json({ success: false, message: "Name must be a string" });
    }

    if (age && (isNaN(age) || age < 18 || age > 100)) {
      return res.status(400).json({ success: false, message: "Age must be a valid number between 18 and 100" });
    }

    if (location && typeof location !== "string") {
      return res.status(400).json({ success: false, message: "Location must be a string" });
    }

    if (education && typeof education !== "string") {
      return res.status(400).json({ success: false, message: "Education must be a string" });
    }

    if (profession && typeof profession !== "string") {
      return res.status(400).json({ success: false, message: "Profession must be a string" });
    }

    if (religion && typeof religion !== "string") {
      return res.status(400).json({ success: false, message: "Religion must be a string" });
    }

    if (bio && (typeof bio !== "string" || bio.length > 500)) {
      return res.status(400).json({ success: false, message: "Bio must be a string up to 500 characters" });
    }

    if (interests && !Array.isArray(interests)) {
      return res.status(400).json({ success: false, message: "Interests must be an array" });
    }

    if (photos && !Array.isArray(photos)) {
      return res.status(400).json({ success: false, message: "Photos must be an array" });
    }

    // 🧩 4. Update fields safely
    if (name) user.name = name.trim();
    if (age) user.age = Number(age);
    if (location) user.location = location.trim();
    if (education) user.education = education.trim();
    if (profession) user.profession = profession.trim();
    if (religion) user.religion = religion.trim();
    if (bio) user.bio = bio.trim();
    if (Array.isArray(interests)) user.interests = interests;
    if (Array.isArray(photos)) user.photos = photos;

    // 🧩 5. Save user
    await user.save();

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user,
    });
  } catch (error) {
    console.error("Error updating user profile:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
