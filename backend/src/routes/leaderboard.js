const express = require('express');
const router = express.Router();
const userauth = require('../middleware/usermiddleware');
const {showallseasonid,getleaderboard} = require('../controllers/leaderboard');

router.get('/all', userauth , showallseasonid);

router.get('/:sid',userauth,getleaderboard);

module.exports = router;