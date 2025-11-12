import { connectDB } from "./config/db.js";
import User from "./models/User.js";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

async function seedAdmin() {
  try {
    // Connect to database
    await connectDB();
    console.log("Database connected");

    const adminEmail = "admin@bandhan.com";
    const adminPassword = "password";

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminEmail });
    
    if (existingAdmin) {
      // Update existing admin user
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      existingAdmin.password = hashedPassword;
      existingAdmin.role = "admin";
      existingAdmin.name = existingAdmin.name || "Admin User";
      existingAdmin.isVerified = true;
      existingAdmin.status = "active";
      await existingAdmin.save();
      console.log("Admin user updated successfully!");
      console.log(`Email: ${adminEmail}`);
      console.log(`Password: ${adminPassword}`);
      console.log(`Role: admin`);
      console.log(`User ID: ${existingAdmin._id}`);
    } else {
      // Create new admin user
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      
      const adminUser = await User.create({
        name: "Admin User",
        email: adminEmail,
        password: hashedPassword,
        phone_no: "1234567890",
        date_of_birth: "1990-01-01",
        gender: "other",
        terms_accepted: true,
        role: "admin",
        isVerified: true,
        status: "active"
      });

      console.log("Admin user created successfully!");
      console.log(`Email: ${adminEmail}`);
      console.log(`Password: ${adminPassword}`);
      console.log(`Role: admin`);
      console.log(`User ID: ${adminUser._id}`);
    }

    process.exit(0);
  } catch (error) {
    console.error("Error seeding admin user:", error);
    process.exit(1);
  }
}

seedAdmin();

