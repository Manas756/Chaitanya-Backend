const express = require("express");
const router = express.Router();
const auth = require("../middleware/authmiddleware");
const controller = require("../controller/idCardController");

router.get("/me", auth, controller.getMyIdCard);

module.exports = router;