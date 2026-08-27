const Event = require("../models/event");

exports.listEvents = async (req, res) => {
  const filter = { status: "published" };
  if (req.query.category) filter.category = req.query.category;
  if (req.query.featured === "true") filter.featured = true;
  const events = await Event.find(filter).sort({ startsAt: 1 }).lean();
  res.json({ success: true, data: events });
};

exports.getEvent = async (req, res) => {
  const event = await Event.findOne({ _id: req.params.id, status: "published" }).lean();
  if (!event) return res.status(404).json({ success: false, message: "Event not found" });
  res.json({ success: true, data: event });
};

exports.createEvent = async (req, res) => {
  const event = await Event.create(req.body);
  res.status(201).json({ success: true, message: "Event created", data: event });
};

exports.updateEvent = async (req, res) => {
  const event = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!event) return res.status(404).json({ success: false, message: "Event not found" });
  res.json({ success: true, message: "Event updated", data: event });
};

exports.deleteEvent = async (req, res) => {
  const event = await Event.findByIdAndUpdate(req.params.id, { status: "cancelled" }, { new: true });
  if (!event) return res.status(404).json({ success: false, message: "Event not found" });
  res.json({ success: true, message: "Event cancelled" });
};