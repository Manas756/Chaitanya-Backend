const Registration = require("../models/registration");

exports.getMyIdCard = async (req, res) => {
  const registrations = await Registration.find({ user: req.user._id, status: "confirmed" })
    .populate("event", "title category startsAt venue")
    .populate("team", "name code")
    .select("participantId type teamName teamCode members event team")
    .lean();
  res.json({
    success: true,
    data: {
      participantId: registrations[0]?.participantId || null,
      name: req.user.name,
      email: req.user.email,
      registrations,
    },
  });
};