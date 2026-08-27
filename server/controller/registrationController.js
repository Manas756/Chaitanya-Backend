const crypto = require("crypto");
const Event = require("../models/event");
const Registration = require("../models/registration");
const Team = require("../models/team");

const createParticipantId = () => `CH-${crypto.randomBytes(5).toString("hex").toUpperCase()}`;
const createTeamCode = () => crypto.randomBytes(3).toString("hex").toUpperCase();
const reserveEventSeat = (eventId) => Event.findOneAndUpdate(
  { _id: eventId, status: "published", $expr: { $lt: ["$registrationCount", "$capacity"] } },
  { $inc: { registrationCount: 1 } }, { new: true }
);
const releaseEventSeat = (eventId) => Event.updateOne(
  { _id: eventId, registrationCount: { $gt: 0 } }, { $inc: { registrationCount: -1 } }
);
const createRegistration = (req, eventId, team, teamName, teamCode) => Registration.create({
  event: eventId, user: req.user._id, type: team ? "team" : "individual",
  team: team?._id, teamName, teamCode, participantId: createParticipantId(),
});

exports.registerIndividual = async (req, res) => {
  const { eventId } = req.body;
  if (!eventId) return res.status(400).json({ success: false, message: "eventId is required" });
  const event = await reserveEventSeat(eventId);
  if (!event) return res.status(409).json({ success: false, message: "Event is unavailable or full" });
  try {
    const registration = await createRegistration(req, eventId);
    res.status(201).json({ success: true, message: "Individual registration successful", data: registration });
  } catch (error) {
    await releaseEventSeat(eventId);
    if (error.code === 11000) return res.status(409).json({ success: false, message: "Already registered for this event" });
    throw error;
  }
};

exports.createTeam = async (req, res) => {
  const { eventId, teamName } = req.body;
  if (!eventId || typeof teamName !== "string" || !teamName.trim()) {
    return res.status(400).json({ success: false, message: "eventId and teamName are required" });
  }
  const event = await reserveEventSeat(eventId);
  if (!event) return res.status(409).json({ success: false, message: "Event is unavailable or full" });
  let createdTeam;
  try {
    createdTeam = await Team.create({ event: eventId, name: teamName.trim(), code: createTeamCode(), captain: req.user._id, members: [req.user._id] });
    const registration = await createRegistration(req, eventId, createdTeam, createdTeam.name, createdTeam.code);
    res.status(201).json({ success: true, message: "Team created and registration successful", data: { registration, teamCode: createdTeam.code, teamName: createdTeam.name } });
  } catch (error) {
    if (createdTeam) await Team.deleteOne({ _id: createdTeam._id });
    await releaseEventSeat(eventId);
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
  const event = await reserveEventSeat(eventId);
  if (!event) return res.status(409).json({ success: false, message: "Event is unavailable or full" });
  let updatedTeam;
  try {
    updatedTeam = await Team.findOneAndUpdate(
      { _id: team._id, members: { $ne: req.user._id } },
      { $addToSet: { members: req.user._id } }, { new: true }
    );
    if (!updatedTeam) {
      await releaseEventSeat(eventId);
      return res.status(409).json({ success: false, message: "You are already in this team" });
    }
    const registration = await createRegistration(req, eventId, updatedTeam, updatedTeam.name, updatedTeam.code);
    res.status(201).json({ success: true, message: "Joined team and registration successful", data: { registration, teamCode: updatedTeam.code, teamName: updatedTeam.name } });
  } catch (error) {
    await releaseEventSeat(eventId);
    if (updatedTeam) await Team.updateOne({ _id: updatedTeam._id }, { $pull: { members: req.user._id } });
    if (error.code === 11000) return res.status(409).json({ success: false, message: "Already registered for this event" });
    throw error;
  }
};

exports.getMyRegistrations = async (req, res) => {
  const registrations = await Registration.find({ user: req.user._id })
    .populate("event", "title startsAt venue").populate("team", "name code").lean();
  res.json({ success: true, data: registrations });
};

exports.cancelRegistration = async (req, res) => {
  const registration = await Registration.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id, status: "confirmed" }, { status: "cancelled" }, { new: true }
  );
  if (!registration) return res.status(404).json({ success: false, message: "Registration not found" });
  await releaseEventSeat(registration.event);
  if (registration.team) await Team.updateOne({ _id: registration.team }, { $pull: { members: req.user._id } });
  res.json({ success: true, message: "Registration cancelled", data: registration });
};
