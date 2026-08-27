const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  category: { type: String, required: true, trim: true, index: true },
  capacity: { type: Number, required: true, min: 1 },
  fee: { type: Number, default: 0, min: 0 },
  registrationCount: { type: Number, default: 0, min: 0 },
  startsAt: { type: Date, required: true },
  endsAt: { type: Date, required: true },
  venue: { type: String, required: true, trim: true },
  rules: { type: String, trim: true },
  prize: { type: String, trim: true },
  coordinators: [{ type: String, trim: true }],
  images: [{ type: String, trim: true }],
  featured: { type: Boolean, default: false },
  status: { type: String, enum: ["draft", "published", "cancelled"], default: "draft", index: true },
}, { timestamps: true });

eventSchema.index({ startsAt: 1, status: 1 });

module.exports = mongoose.model("Event", eventSchema);