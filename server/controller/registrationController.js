const crypto = require("crypto");
const mongoose = require("mongoose");
const Event = require("../models/event");
const Registration = require("../models/registration");
const Team = require("../models/team");
const { parsePagination } = require("../middleware/validation");

const createParticipantId = () => `CH-${crypto.randomBytes(5).toString("hex").toUpperCase()}`;
const createTeamCode = () => crypto.randomBytes(3).toString("hex").toUpperCase();
const reserveEventSeat = (eventId, session) => Event.findOneAndUpdate(
  { _id: eventId, status: "published", $expr: { $lt: ["$registrationCount", "$capacity"] } },
  { $inc: { registrationCount: 1 } }, { new: true, session }
);
const releaseEventSeat = (eventId, session) => Event.updateOne(
  { _id: eventId, registrationCount: { $gt: 0 } }, { $inc: { registrationCount: -1 } }, { session }
);
const createRegistration = (req, eventId, team, teamName, teamCode, session) => Registration.create([{
  event: eventId, user: req.user._id, type: team ? "team" : "individual",
  team: team?._id, teamName, teamCode, participantId: createParticipantId(),
}], { session }).then(([registration]) => registration);

exports.registerIndividual = async (req, res) => {
  const { eventId } = req.body;
  if (!eventId) return res.status(400).json({ success: false, message: "eventId is required" });
  try {
    let registration;
    await mongoose.connection.transaction(async (session) => {
      const event = await reserveEventSeat(eventId, session);
      if (!event) throw Object.assign(new Error("Event is unavailable or full"), { statusCode: 409 });
      registration = await createRegistration(req, eventId, null, undefined, undefined, session);
    });
    res.status(201).json({ success: true, message: "Individual registration successful", data: registration });
  } catch (error) {
    if (error.statusCode === 409) return res.status(409).json({ success: false, message: error.message });
    if (error.code === 11000) return res.status(409).json({ success: false, message: "Already registered for this event" });
    throw error;
  }
};

exports.createTeam = async (req, res) => {
  const { eventId, teamName } = req.body;
  if (!eventId || typeof teamName !== "string" || !teamName.trim()) {
    return res.status(400).json({ success: false, message: "eventId and teamName are required" });
  }
  let createdTeam;
  try {
    let registration;
    await mongoose.connection.transaction(async (session) => {
      const event = await reserveEventSeat(eventId, session);
      if (!event) throw Object.assign(new Error("Event is unavailable or full"), { statusCode: 409 });
      [createdTeam] = await Team.create([{ event: eventId, name: teamName.trim(), code: createTeamCode(), captain: req.user._id, members: [req.user._id] }], { session });
      registration = await createRegistration(req, eventId, createdTeam, createdTeam.name, createdTeam.code, session);
    });
    res.status(201).json({ success: true, message: "Team created and registration successful", data: { registration, teamCode: createdTeam.code, teamName: createdTeam.name } });
  } catch (error) {
    if (error.statusCode === 409 && error.message === "Event is unavailable or full") return res.status(409).json({ success: false, message: error.message });
    if (error.code === 11000) return res.status(409).json({ success: false, message: "Team name or registration already exists for this event" });
    throw error;
  }
};

exports.joinTeam = async (req, res) => {
  const { eventId, teamCode } = req.body;
  if (!eventId || typeof teamCode !== "string" || !teamCode.trim()) {
    return res.status(400).json({ success: false, message: "eventId and teamCode are required" });
  }
  const team = await Team.findOne({ event: eventId, code: teamCode.trim().toUpperCase() });
  if (!team) return res.status(404).json({ success: false, message: "Team not found for this event" });
  try {
    let updatedTeam;
    let registration;
    await mongoose.connection.transaction(async (session) => {
      const event = await reserveEventSeat(eventId, session);
      if (!event) throw Object.assign(new Error("Event is unavailable or full"), { statusCode: 409 });
      updatedTeam = await Team.findOneAndUpdate(
        { _id: team._id, members: { $ne: req.user._id } },
        { $addToSet: { members: req.user._id } }, { new: true, session }
      );
      if (!updatedTeam) throw Object.assign(new Error("You are already in this team"), { statusCode: 409 });
      registration = await createRegistration(req, eventId, updatedTeam, updatedTeam.name, updatedTeam.code, session);
    });
    res.status(201).json({ success: true, message: "Joined team and registration successful", data: { registration, teamCode: updatedTeam.code, teamName: updatedTeam.name } });
  } catch (error) {
    if (error.statusCode === 409) return res.status(409).json({ success: false, message: error.message });
    if (error.code === 11000) return res.status(409).json({ success: false, message: "Already registered for this event" });
    throw error;
  }
};

exports.getMyRegistrations = async (req, res) => {
  const pagination = parsePagination(req.query);
  if (pagination.error) return res.status(400).json({ success: false, message: pagination.error, error: "INVALID_PAGINATION" });
  const registrations = await Registration.find({ user: req.user._id })
    .populate("event", "title startsAt venue").populate("team", "name code")
    .sort({ createdAt: -1 }).skip(pagination.skip).limit(pagination.limit).lean();
  const total = await Registration.countDocuments({ user: req.user._id });
  res.json({ success: true, data: registrations, pagination: { page: pagination.page, limit: pagination.limit, total, pages: Math.ceil(total / pagination.limit) } });
};

exports.cancelRegistration = async (req, res) => {
  let registration;
  await mongoose.connection.transaction(async (session) => {
    registration = await Registration.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id, status: "confirmed" }, { status: "cancelled" }, { new: true, session }
    );
    if (!registration) throw Object.assign(new Error("Registration not found"), { statusCode: 404 });
    await releaseEventSeat(registration.event, session);
    if (registration.team) await Team.updateOne({ _id: registration.team }, { $pull: { members: req.user._id } }, { session });
  });
  res.json({ success: true, message: "Registration cancelled", data: registration });
};
