const express = require('express');
const router = express.Router();
const userauth = require('../middleware/usermiddleware');
const phasemiddleware = require('../middleware/phaseguard');
const {showallseasonid,getleaderboard, getmystats, manipulateGuestStats} = require('../controllers/leaderboard');

router.get('/all', userauth , showallseasonid);

router.get('/mystats/:seasonId', userauth, phasemiddleware(['Round1', 'Round2', 'Round1Solution', 'Round2Solution']), getmystats);

router.put('/guest/manipulate-stats', userauth, phasemiddleware(['Round1', 'Round2', 'Round1Solution', 'Round2Solution']), manipulateGuestStats);

router.get('/:sid',userauth,getleaderboard);

module.exports = router;