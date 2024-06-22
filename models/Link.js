const mongoose = require('mongoose');

const LinkSchema = new mongoose.Schema({
  originalUrl: String,
  shortUrl: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Link', LinkSchema);
