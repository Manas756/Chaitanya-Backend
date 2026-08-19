const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const {
  registerIndividual,
  registerTeam,
  getMyRegistrations,
  cancelRegistration,
} = require('../controller/registrationController');

router.post('/individual', authMiddleware, registerIndividual);
router.post('/team', authMiddleware, registerTeam);
router.get('/me', authMiddleware, getMyRegistrations);
router.delete('/:id', authMiddleware, cancelRegistration);

module.exports = router;