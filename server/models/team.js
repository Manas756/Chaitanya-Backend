const mongoose = require("mongoose");

const teamSchema = new mongoose.Schema({
  event: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
  name: { type: String, required: true, trim: true },
  code: { type: String, required: true, uppercase: true, trim: true },
  captain: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
}, { timestamps: true });

teamSchema.index({ event: 1, code: 1 }, { unique: true });
teamSchema.index({ event: 1, name: 1 }, { unique: true });

module.exports = mongoose.model("Team", teamSchema);