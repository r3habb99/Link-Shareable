const mongoose = require('mongoose');

const DeviceDataSchema = new mongoose.Schema({
  ip: String,
  browser: String,
  os: String,
  device: String,
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
  body: mongoose.Schema.Types.Mixed
});

module.exports = mongoose.model('DeviceData', DeviceDataSchema);
