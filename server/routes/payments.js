const express = require("express");
const router = express.Router();
const auth = require("../middleware/authmiddleware");
const controller = require("../controller/paymentController");

router.post("/orders", auth, controller.createOrder);
router.post("/verify", auth, controller.verifyPayment);

module.exports = router;