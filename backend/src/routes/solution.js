const express = require('express');
const router = express.Router();
const userauth = require('../middleware/usermiddleware');
const restrictToPhase = require('../middleware/phaseguard');
const { getSolutionsHub } = require('../controllers/solution');

router.get('/', userauth, restrictToPhase(['Round1Solution', 'Round2Solution']), getSolutionsHub);

module.exports = router;