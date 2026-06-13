const express = require('express');
const  userauth  = require('../middleware/usermiddleware');
const router = express.Router();
const { submitcode, runcode } = require('../controllers/usersubmission');
const restrictToPhase = require('../middleware/phaseguard');

router.post("/submit/:id",userauth,restrictToPhase(['Round1', 'Round2']),submitcode);
router.post("/run/:id",userauth,restrictToPhase(['Round1', 'Round2']),runcode);

module.exports = router;