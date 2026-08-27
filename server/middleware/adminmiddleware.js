module.exports = (req, res, next) => {
	if (!req.user || !["admin", "superadmin"].includes(req.user.role)) {
		return res.status(403).json({ message: "Admin access required" });
	}

	next();
};
