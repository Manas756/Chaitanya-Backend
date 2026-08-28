const Event = require("../models/event");
const { parsePagination } = require("../middleware/validation");
const cache = require("../utils/sessionStore");

exports.listEvents = async (req, res) => {
  const pagination = parsePagination(req.query);
  if (pagination.error) return res.status(400).json({ success: false, message: pagination.error, error: "INVALID_PAGINATION" });
  const filter = { status: "published" };
  if (req.query.category) filter.category = req.query.category;
  if (req.query.featured !== undefined && !["true", "false"].includes(req.query.featured)) {
    return res.status(400).json({ success: false, message: "featured must be true or false", error: "INVALID_QUERY" });
  }
  if (req.query.featured === "true") filter.featured = true;
  const cacheKey = `events:${pagination.page}:${pagination.limit}:${req.query.category || "all"}:${req.query.featured || "all"}`;
  const cached = await cache.getCache(cacheKey);
  if (cached) return res.json(cached);
  const [events, total] = await Promise.all([
    Event.find(filter).sort({ startsAt: 1 }).skip(pagination.skip).limit(pagination.limit).lean(),
    Event.countDocuments(filter),
  ]);
  const response = { success: true, data: events, pagination: { page: pagination.page, limit: pagination.limit, total, pages: Math.ceil(total / pagination.limit) } };
  await cache.setCache(cacheKey, response, 30);
  res.json(response);
};

exports.getEvent = async (req, res) => {
  const event = await Event.findOne({ _id: req.params.id, status: "published" }).lean();
  if (!event) return res.status(404).json({ success: false, message: "Event not found" });
  res.json({ success: true, data: event });
};

exports.createEvent = async (req, res) => {
  const event = await Event.create(req.body);
  await cache.clearCache("events:");
  res.status(201).json({ success: true, message: "Event created", data: event });
};

exports.updateEvent = async (req, res) => {
  const event = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!event) return res.status(404).json({ success: false, message: "Event not found" });
  await cache.clearCache("events:");
  res.json({ success: true, message: "Event updated", data: event });
};

exports.deleteEvent = async (req, res) => {
  const event = await Event.findByIdAndUpdate(req.params.id, { status: "cancelled" }, { new: true });
  if (!event) return res.status(404).json({ success: false, message: "Event not found" });
  await cache.clearCache("events:");
  res.json({ success: true, message: "Event cancelled" });
};