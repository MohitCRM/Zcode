const express = require('express');
const router = express.Router();
const userauth = require('../middleware/usermiddleware');
const {showallseasons,getleaderboard} = require('../controllers/leaderboard');

router.get('/', userauth , showallseasons);

router.get('/:sid',userauth,getleaderboard);

module.exports = router;