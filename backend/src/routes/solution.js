const express = require('express');
const router = express.Router();
const userauth = require('../middleware/usermiddleware');
const restrictToPhase = require('../middleware/phaseguard');
const { getSolutionDashboard } = require('../controllers/solutionController');

router.get('/', userauth, restrictToPhase(['Round1Solution', 'Round2Solution']), getSolutionDashboard);

module.exports = router;