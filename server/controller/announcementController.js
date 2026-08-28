const Announcement = require("../models/announcement");
const { parsePagination } = require("../middleware/validation");
const cache = require("../utils/sessionStore");

exports.listAnnouncements = async (req, res) => {
  const pagination = parsePagination(req.query);
  if (pagination.error) return res.status(400).json({ success: false, message: pagination.error, error: "INVALID_PAGINATION" });
  const filter = { published: true };
  const cacheKey = `announcements:${pagination.page}:${pagination.limit}`;
  const cached = await cache.getCache(cacheKey);
  if (cached) return res.json(cached);
  const [announcements, total] = await Promise.all([
    Announcement.find(filter).sort({ publishedAt: -1, createdAt: -1 }).skip(pagination.skip).limit(pagination.limit).lean(),
    Announcement.countDocuments(filter),
  ]);
  const response = { success: true, data: announcements, pagination: { page: pagination.page, limit: pagination.limit, total, pages: Math.ceil(total / pagination.limit) } };
  await cache.setCache(cacheKey, response, 30);
  res.json(response);
};

exports.createAnnouncement = async (req, res) => {
  const announcement = await Announcement.create(req.body);
  await cache.clearCache("announcements:");
  res.status(201).json({ success: true, message: "Announcement created", data: announcement });
};

exports.updateAnnouncement = async (req, res) => {
  const update = { ...req.body };
  if (update.published === true) update.publishedAt = new Date();
  const announcement = await Announcement.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true });
  if (!announcement) return res.status(404).json({ success: false, message: "Announcement not found" });
  await cache.clearCache("announcements:");
  res.json({ success: true, message: "Announcement updated", data: announcement });
};

exports.deleteAnnouncement = async (req, res) => {
  const announcement = await Announcement.findByIdAndDelete(req.params.id);
  if (!announcement) return res.status(404).json({ success: false, message: "Announcement not found" });
  await cache.clearCache("announcements:");
  res.json({ success: true, message: "Announcement deleted" });
};