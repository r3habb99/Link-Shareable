const mongoose = require('mongoose');

const DeviceDataSchema = new mongoose.Schema({
  ip: String,
  ips: [String],

  // User agent details
  browser: String,
  os: String,
  device: String,

  // Request details
  timestamp: { type: Date, default: Date.now },
  headers: mongoose.Schema.Types.Mixed,
  path: String,
  query: mongoose.Schema.Types.Mixed,
  method: String,
  protocol: String,
  hostname: String,
  httpVersion: String,
  originalUrl: String,
  subdomains: [String],
  referrer: String,
  cookies: mongoose.Schema.Types.Mixed,
  body: mongoose.Schema.Types.Mixed,

  // Additional fields
  userId: String, // Example: If you have a user authentication system
  userAgent: mongoose.Schema.Types.Mixed, // Full user agent object
  linkId: { type: mongoose.Schema.Types.ObjectId, ref: 'Link' }, // Reference to the Link model
  uniqueVisitorId: String, // Unique visitor ID
  location: { // Location details
    country: String,
    region: String,
    city: String,
    latitude: Number,
    longitude: Number
  }
});

module.exports = mongoose.model('DeviceData', DeviceDataSchema);
