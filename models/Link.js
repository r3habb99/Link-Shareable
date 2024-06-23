const mongoose = require('mongoose');

const LinkSchema = new mongoose.Schema({
  originalUrl: String,
  shortUrl: String,
  createdAt: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true }, // New field to track if the link is active
  uniqueVisitorIds: [{ type: String }] // New field to store unique visitor IDs
});

module.exports = mongoose.model('Link', LinkSchema);
