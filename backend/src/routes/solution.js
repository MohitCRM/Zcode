const express = require('express');
const router = express.Router();
const userauth = require('../middleware/usermiddleware');
const restrictToPhase = require('../middleware/phaseguard');
const {  getProblemSolutionHub,getthisroundsolutions } = require('../controllers/solution');

router.get('/all', userauth, restrictToPhase(['Round1Solution', 'Round2Solution']), getthisroundsolutions);
router.get('/:pid',userauth, restrictToPhase(['Round1Solution', 'Round2Solution']), getProblemSolutionHub);

module.exports = router;