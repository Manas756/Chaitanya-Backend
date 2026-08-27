const express = require("express");
const router = express.Router();
const auth = require("../middleware/authmiddleware");
const admin = require("../middleware/adminmiddleware");
const controller = require("../controller/announcementController");

router.get("/", controller.listAnnouncements);
router.post("/", auth, admin, controller.createAnnouncement);
router.patch("/:id", auth, admin, controller.updateAnnouncement);
router.delete("/:id", auth, admin, controller.deleteAnnouncement);

module.exports = router;