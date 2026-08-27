const jwt = require("jsonwebtoken");
const User = require("../models/user");

module.exports = async (req, res, next) => {
	try {
		const authorization = req.headers.authorization || "";
		const [scheme, token] = authorization.split(" ");

		if (scheme !== "Bearer" || !token) {
			return res.status(401).json({ message: "Authentication required" });
		}

		const payload = jwt.verify(token, process.env.JWT_SECRET);
		const user = await User.findById(payload.userId).select("-password");

		if (!user || !user.isVerified) {
			return res.status(401).json({ message: "User is not authorized" });
		}

		req.user = user;
		next();
	} catch (error) {
		return res.status(401).json({ message: "Invalid or expired token" });
	}
};
