const express = require("express");
const router = express.Router();
const auth = require("../middleware/authmiddleware");
const admin = require("../middleware/adminmiddleware");
const { requireObjectId } = require("../middleware/validation");
const controller = require("../controller/eventController");

router.get("/", controller.listEvents);
router.get("/:id", requireObjectId("id"), controller.getEvent);
router.post("/", auth, admin, controller.createEvent);
router.patch("/:id", requireObjectId("id"), auth, admin, controller.updateEvent);
router.delete("/:id", requireObjectId("id"), auth, admin, controller.deleteEvent);

module.exports = router;