// import User from "../models/User.js";
// import bcrypt from "bcryptjs";
// import jwt from "jsonwebtoken";

// // POST /api/login
// const loginUser = async (req, res) => {
//   const { email, password } = req.body;

//   try {
//     // 1️⃣ Find user by email
//     const user = await User.findOne({ email });
//     if (!user) {
//       return res.status(400).json({ success: false, message: "Invalid email or password" });
//     }

//     // 2️⃣ Compare password
//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) {
//       return res.status(400).json({ success: false, message: "Invalid email or password" });
//     }

//     // 3️⃣ Generate JWT token (optional but recommended)
//     const userToken = jwt.sign(
//       { userId: user._id, email: user.email },
//       process.env.JWT_SECRET,
//       { expiresIn: "7d" }
//     );

//     // 4️⃣ Send response
//     res.status(200).json({
//       success: true,
//       message: "Login successful",
//       user: {
//         id: user._id,
//         name: user.name,
//         email: user.email,

//       },
//       userToken,
//     });
//   } catch (error) {
//     console.error("Login error:", error);
//     res.status(500).json({ success: false, message: "Server error", error });
//   }
// };

// export default loginUser;


import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// POST /api/login
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1️⃣ Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid email or password" });
    }

    // 2️⃣ Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Invalid email or password" });
    }

    // 3️⃣ Generate JWT token (include role and email for admin authentication)
    const userToken = jwt.sign(
      { userId: user._id, email: user.email, role: user.role || 'user' },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // 4️⃣ Prepare full user data (excluding password)
    const userData = {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone_no: user.phone_no,
      date_of_birth: user.date_of_birth,
      gender: user.gender,
      terms_accepted: user.terms_accepted,
      interests: user.interests || [],
      photos: user.photos || [],
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      age: user.age,
      education: user.education,
      location: user.location,
      profession: user.profession,
      religion: user.religion,
      bio: user.bio,
      role: user.role || 'user',
    };

    // 5️⃣ Send response
    res.status(200).json({
      success: true,
      message: "Login successful",
      token: userToken,
      user: userData,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ success: false, message: "Server error", error });
  }
};

export default loginUser;
