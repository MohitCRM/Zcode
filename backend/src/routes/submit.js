const express = require('express');
const  userauth  = require('../middleware/usermiddleware');
const router = express.Router();
const { submitcode, runcode } = require('../controllers/usersubmission');

router.post("/submit/:id",userauth,submitcode);
router.post("/run/:id",userauth,runcode);

module.exports = router;