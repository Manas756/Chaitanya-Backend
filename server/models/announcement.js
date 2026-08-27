const mongoose = require("mongoose");

const announcementSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  message: { type: String, required: true, trim: true },
  published: { type: Boolean, default: false, index: true },
  publishedAt: Date,
}, { timestamps: true });

module.exports = mongoose.model("Announcement", announcementSchema);