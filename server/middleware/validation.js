const mongoose = require("mongoose");

const isObjectId = (value) => mongoose.isValidObjectId(value);

const parsePagination = (query) => {
  const page = Number(query.page || 1);
  const limit = Number(query.limit || 20);
  if (!Number.isInteger(page) || page < 1) return { error: "page must be a positive integer" };
  if (!Number.isInteger(limit) || limit < 1 || limit > 100) return { error: "limit must be an integer between 1 and 100" };
  return { page, limit, skip: (page - 1) * limit };
};

const requireObjectId = (parameter) => (req, res, next) => {
  if (!isObjectId(req.params[parameter])) {
    return res.status(400).json({ success: false, message: `Invalid ${parameter}`, error: "INVALID_ID" });
  }
  next();
};

module.exports = { isObjectId, parsePagination, requireObjectId };