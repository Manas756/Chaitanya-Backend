const express = require("express");
const router = express.Router();
const auth = require("../middleware/authmiddleware");
const controller = require("../controller/registrationController");

router.post("/individual", auth, controller.registerIndividual);
router.post("/team/create", auth, controller.createTeam);
router.post("/team/join", auth, controller.joinTeam);
router.get("/me", auth, controller.getMyRegistrations);
router.delete("/:id", auth, controller.cancelRegistration);

module.exports = router;