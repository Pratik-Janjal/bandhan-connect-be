import User from "../models/User.js";
import cloudinary from "../config/cloudinary.js";

// ✅ STEP 1: Add Profile Info (Age, Location, Education, etc.)
export const addProfileInfo = async (req, res) => {
  const { userId, age, location, education, profession, religion } = req.body;

  try {
    const user = await User.findByIdAndUpdate(
      userId,
      { age, location, education, profession, religion },
      { new: true }
    );

    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({
      success: true,
      message: "Profile info updated successfully",
    //   user,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error });
  }
};

// ✅ STEP 2: Add Bio and Interests
export const addBio = async (req, res) => {
  const { userId, bio, interests } = req.body;

  try {
    const user = await User.findByIdAndUpdate(
      userId,
      { bio, interests },
      { new: true }
    );

    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({
      success: true,
      message: "Bio and interests updated successfully",
    //   user,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error });
  }
};


// ✅ STEP 3: Add Photos
export const addPhotos = async (req, res) => {
  const { userId } = req.body;

  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ success: false, message: "At least one photo is required" });
  }

  try {
    // Upload each photo to Cloudinary
    const photoUrls = [];
    for (const file of req.files) {
      const result = await cloudinary.uploader.upload(file.path, {
        folder: "user_photos",
      });
      photoUrls.push(result.secure_url);
    }

    // Update user document by adding photos
    const user = await User.findByIdAndUpdate(
      userId,
      { $push: { photos: { $each: photoUrls } } }, // Append new photos
      { new: true }
    );

    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    res.status(200).json({
      success: true,
      message: "Photos added successfully",
      photos: user.photos,
    });
  } catch (error) {
    console.error("Add photos error:", error);
    res.status(500).json({ success: false, message: "Server error", error });
  }
};


// ✅ STEP 4: Set Partner Preferences
export const setPartnerPreferences = async (req, res) => {
  const { userId, partnerPreferences } = req.body;

  if (!partnerPreferences) {
    return res.status(400).json({ success: false, message: "Partner preferences required" });
  }

  try {
    const user = await User.findByIdAndUpdate(
      userId,
      { partnerPreferences },
      { new: true }
    );

    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({
      success: true,
      message: "Partner preferences updated successfully",
    //   user,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error });
  }
};
