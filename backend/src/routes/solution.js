const express = require('express');
const router = express.Router();
const userauth = require('../middleware/usermiddleware');
const restrictToPhase = require('../middleware/phaseguard');
const guestmiddleware = require('../middleware/guestmiddleware');
const {  getProblemSolutionHub,getthisroundsolutions,guestgetallsolutions,guestsolutionhub } = require('../controllers/solution');

//guest routes
router.get('/guest/all', userauth,guestmiddleware, guestgetallsolutions);
router.get('/guest/:pid', userauth,guestmiddleware, guestsolutionhub);

//user routes
router.get('/all', userauth, restrictToPhase(['Round1Solution', 'Round2Solution']), getthisroundsolutions);
router.get('/:pid',userauth, restrictToPhase(['Round1Solution', 'Round2Solution']), getProblemSolutionHub);

module.exports = router;