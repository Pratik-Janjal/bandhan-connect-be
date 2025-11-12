import User from "../models/User.js";
import { calculateCompatibility } from "../utils/compatibility.js";

const getUserFeed = async (req, res) => {
  try {
    const userId = req.params.userId;

    const currentUser = await User.findById(userId);
    if (!currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const prefs = currentUser.partnerPreferences || {};

    // 🎯 Base filters (always applied)
    const baseFilter = {
      _id: { $ne: userId }, // exclude self
      age: {
        $gte: prefs.ageRange?.min || 18,
        $lte: prefs.ageRange?.max || 60,
      },
    };

    // 💡 Soft filters (preference-based)
    const orFilters = [];
    if (prefs.location && prefs.location !== "Any")
      orFilters.push({ location: prefs.location });
    if (prefs.education && prefs.education !== "Any")
      orFilters.push({ education: prefs.education });
    if (prefs.profession && prefs.profession !== "Any")
      orFilters.push({ profession: prefs.profession });
    if (prefs.religion && prefs.religion !== "Any")
      orFilters.push({ religion: prefs.religion });

    // 🎯 Step 1: Try to find matches using preferences
    let query = orFilters.length > 0 ? { ...baseFilter, $or: orFilters } : baseFilter;

    let matches = await User.find(query)
      .select("-password -email")
      .limit(20);

    // 🚨 Step 2: If no matches found, broaden the search (fallback)
    if (matches.length === 0) {
      console.log("⚠️ No preference-based matches found — loading fallback users...");
      matches = await User.find({
        _id: { $ne: userId },
        age: { $gte: 18, $lte: 60 },
      })
        .select("-password -email")
        .limit(20);
    }

    // 🧠 Step 3: Calculate compatibility for all shown users
    const cleanedMatches = matches.map((user) => {
      const compatibility = calculateCompatibility(currentUser, user);
      return {
        id: user._id,
        name: user.name,
        age: user.age,
        location: user.location,
        education: user.education,
        profession: user.profession,
        religion: user.religion,
        bio: user.bio,
        interests: user.interests,
        photos: user.photos,
        compatibility,
      };
    });

    res.status(200).json({ matches: cleanedMatches });
  } catch (error) {
    console.error("Error fetching user feed:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export default getUserFeed;
