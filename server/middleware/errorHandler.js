module.exports = (error, req, res, next) => {
  console.error(`${req.method} ${req.originalUrl}`, error.message);

  if (error.name === "ValidationError") {
    return res.status(400).json({ success: false, message: "Invalid request data" });
  }
  if (error.name === "CastError") {
    return res.status(400).json({ success: false, message: "Invalid resource identifier" });
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: process.env.NODE_ENV === "production" ? "Internal server error" : error.message,
  });
};