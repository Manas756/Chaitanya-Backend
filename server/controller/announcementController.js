const Announcement = require("../models/announcement");

exports.listAnnouncements = async (req, res) => {
  const announcements = await Announcement.find({ published: true }).sort({ publishedAt: -1, createdAt: -1 }).lean();
  res.json({ success: true, data: announcements });
};

exports.createAnnouncement = async (req, res) => {
  const announcement = await Announcement.create(req.body);
  res.status(201).json({ success: true, message: "Announcement created", data: announcement });
};

exports.updateAnnouncement = async (req, res) => {
  const update = { ...req.body };
  if (update.published === true) update.publishedAt = new Date();
  const announcement = await Announcement.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true });
  if (!announcement) return res.status(404).json({ success: false, message: "Announcement not found" });
  res.json({ success: true, message: "Announcement updated", data: announcement });
};

exports.deleteAnnouncement = async (req, res) => {
  const announcement = await Announcement.findByIdAndDelete(req.params.id);
  if (!announcement) return res.status(404).json({ success: false, message: "Announcement not found" });
  res.json({ success: true, message: "Announcement deleted" });
};