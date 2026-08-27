const mongoose = require("mongoose");

const registrationSchema = new mongoose.Schema({
  event: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  type: { type: String, enum: ["individual", "team"], required: true },
  team: { type: mongoose.Schema.Types.ObjectId, ref: "Team" },
  teamName: { type: String, trim: true },
  teamCode: { type: String, trim: true, uppercase: true },
  members: [{ type: String, trim: true, lowercase: true }],
  participantId: { type: String, required: true, unique: true },
  status: { type: String, enum: ["confirmed", "cancelled"], default: "confirmed" },
}, { timestamps: true });

registrationSchema.index({ event: 1, user: 1 }, { unique: true });

module.exports = mongoose.model("Registration", registrationSchema);