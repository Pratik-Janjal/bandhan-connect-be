import User from "../models/User.js";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
dotenv.config();

const registerUser = async (req, res) => {
  try {
    const { name, email, password, phone_no, date_of_birth, gender, terms_accepted } = req.body;

    // 🧩 1. Basic required field check
    if (!name || !email || !password || !phone_no || !date_of_birth || !gender) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // 🧩 2. Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    // 🧩 3. Validate phone number (digits only, 8–15 digits)
    const phoneRegex = /^[0-9]{8,15}$/;
    if (!phoneRegex.test(phone_no)) {
      return res.status(400).json({ message: "Invalid phone number" });
    }

    // 🧩 4. Validate password strength (optional)
    if (password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters long" });
    }

    // 🧩 5. Validate date of birth
    let dob;
    if (date_of_birth.includes("-")) {
      const parts = date_of_birth.split("-");
      if (parts[0].length === 4) {
        // YYYY-MM-DD
        dob = new Date(date_of_birth);
      } else {
        // DD-MM-YYYY
        const [day, month, year] = parts;
        dob = new Date(`${year}-${month}-${day}`);
      }
    } else {
      return res.status(400).json({ message: "Invalid date format. Use DD-MM-YYYY or YYYY-MM-DD" });
    }

    if (isNaN(dob.getTime())) {
      return res.status(400).json({ message: "Invalid date of birth" });
    }

    // 🧩 6. Terms acceptance
    if (!terms_accepted) {
      return res.status(400).json({ message: "You must accept the terms and conditions" });
    }

    // 🧩 7. Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // 🧩 8. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 🧩 9. Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      phone_no,
      date_of_birth: dob,
      gender,
      terms_accepted,
    });

    // 🧩 10. Send response
    res.status(201).json({
      message: "User registered successfully",
      user_id: user._id,
    });

  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

export default registerUser;
