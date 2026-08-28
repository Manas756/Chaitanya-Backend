module.exports = (error, req, res, next) => {
  console.error(`${req.method} ${req.originalUrl}`, error.message);

  if (error.name === "ValidationError") {
    return res.status(400).json({ success: false, message: "Invalid request data" });
  }
  if (error.name === "CastError") {
    return res.status(400).json({ success: false, message: "Invalid resource identifier" });
  }

  const status = error.statusCode || 500;
  res.status(status).json({
    success: false,
    message: status >= 500 ? "Internal server error" : error.message,
    error: status >= 500 ? "INTERNAL_ERROR" : "REQUEST_ERROR",
  });
};