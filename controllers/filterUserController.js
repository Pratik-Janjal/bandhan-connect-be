import User from "../models/User.js";

export const filterUsers = async (req, res) => {
  try {
    const { minAge, maxAge, location, education, profession, name, search } = req.query;

    const filter = {};

    // 🧠 Age filter (min & max)
    if (minAge || maxAge) {
      filter.age = {};
      if (minAge) filter.age.$gte = Number(minAge);
      if (maxAge) filter.age.$lte = Number(maxAge);
    }

    // 🧠 Location / Education / Profession filters
    if (location) filter.location = { $regex: location, $options: "i" };
    if (education) filter.education = { $regex: education, $options: "i" };
    if (profession) filter.profession = { $regex: profession, $options: "i" };

    // 🧠 Name-based search (main feature)
    // This allows direct searching by name, or fallback to a general "search" keyword
    if (name || search) {
      const keyword = name || search;
      filter.$or = [
        { name: { $regex: keyword, $options: "i" } }, // partial match by name
        { location: { $regex: keyword, $options: "i" } },
        { profession: { $regex: keyword, $options: "i" } },
        { education: { $regex: keyword, $options: "i" } },
      ];
    }

    const users = await User.find(filter);
    res.json(users);
  } catch (error) {
    console.error("Error filtering users:", error);
    res.status(500).json({ error: error.message });
  }
};
