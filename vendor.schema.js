const mongoose = require('mongoose');
const { Schema } = mongoose;

const VendorSchema = new Schema({
  userId: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  businessName: { 
    type: String, 
    required: true 
  },
  services: [{ 
    type: String, 
    enum: ['catering', 'makeup', 'photography', 'decoration', 'music', 'transport', 'jewelry', 'clothing', 'venue', 'other'],
    required: true 
  }],
  city: { 
    type: String, 
    required: true 
  },
  location: { 
    type: String, 
    required: true 
  },
  address: String,
  phone: String,
  website: String,
  description: String,
  packages: [{
    title: { type: String, required: true },
    description: String,
    price: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    isActive: { type: Boolean, default: true }
  }],
  // Add leads subdocument
  leads: [{
    name: String,
    email: String,
    phone: String,
    service: String,
    message: String,
    status: { type: String, enum: ['new', 'contacted', 'quoted', 'booked', 'lost'], default: 'new' },
    createdAt: { type: Date, default: Date.now }
  }],
  // Add queries subdocument
  queries: [{
    from: String,
    subject: String,
    message: String,
    status: { type: String, enum: ['unread', 'read', 'replied'], default: 'unread' },
    createdAt: { type: Date, default: Date.now },
    reply: String
  }],
  rating: { 
    type: Number, 
    default: 0 
  },
  totalReviews: { 
    type: Number, 
    default: 0 
  },
  isVerified: { 
    type: Boolean, 
    default: false 
  },
  status: { 
    type: String, 
    enum: ['pending', 'active', 'suspended'], 
    default: 'pending' 
  },
  reviews: [{
    clientName: String,
    rating: { type: Number, min: 1, max: 5 },
    comment: String,
    date: Date
  }],
  earnings: [{
    amount: Number,
    date: Date,
    source: String,
    notes: String
  }],
  documents: [{
    name: String,
    url: String,
    type: String,
    uploadedAt: { type: Date, default: Date.now }
  }],
  workingHours: {
    monday: { open: String, close: String },
    tuesday: { open: String, close: String },
    wednesday: { open: String, close: String },
    thursday: { open: String, close: String },
    friday: { open: String, close: String },
    saturday: { open: String, close: String },
    sunday: { open: String, close: String }
  },
  specializations: [String],
  experience: Number, // in years
  portfolio: [String], // image URLs
  socialMedia: {
    facebook: String,
    instagram: String,
    twitter: String
  },
  achievements: [{
    title: String,
    description: String,
    date: Date
  }],
  bookings: [{
    clientName: String,
    service: String,
    date: Date,
    status: { type: String, enum: ['pending', 'confirmed', 'completed', 'cancelled'], default: 'pending' },
    amount: Number,
    notes: String
  }]
}, { timestamps: true });

module.exports = mongoose.model('Vendor', VendorSchema); 