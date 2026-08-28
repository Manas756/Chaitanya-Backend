const mongoose = require("mongoose");

const announcementSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  message: { type: String, required: true, trim: true },
  published: { type: Boolean, default: false, index: true },
  publishedAt: Date,
}, { timestamps: true });

announcementSchema.index({ published: 1, publishedAt: -1, createdAt: -1 });

module.exports = mongoose.model("Announcement", announcementSchema);