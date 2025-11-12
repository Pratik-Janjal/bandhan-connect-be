import mongoose from "mongoose";


// defines how the registered user is stored in the database
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    phone_no : {
        type: String,
        required: true
    },
    date_of_birth: {
        type: String,
        required: true
    },
    gender: {
        type: String,
    },
    password: {
        type: String,
        required: true
    },
    terms_accepted: {
        type: Boolean,
        required: true
    },

    age: { type: Number },
    location: { type: String },
    education: { type: String },
    profession: { type: String },
    religion: { type: String },
  
    // Step 3 - Bio & Interests
    bio: { type: String },
    interests: [{ type: String }], // array of strings
  
    // Step 4 - Photos
    photos: [{ type: String }], // URLs of uploaded photos
  
    // Step 5 - Partner Preferences
    partnerPreferences: {
      ageRange: { min: Number, max: Number },
      location: { type: String },
      education: { type: String },
      profession: { type: String },
    },
    
    // Role field for user permissions
    role: {
      type: String,
      enum: ['user', 'admin', 'vendor', 'counselor', 'community'],
      default: 'user'
    },
    
    // Admin management fields
    isVerified: {
      type: Boolean,
      default: false
    },
    status: {
      type: String,
      enum: ['active', 'pending', 'suspended', 'verified'],
      default: 'pending'
    },
    isPremium: {
      type: Boolean,
      default: false
    }
    
}, { timestamps: true });

// creates the model for the registered user
export default mongoose.model('registeruser', userSchema);