const express = require('express');
const router = express.Router();
const ownermiddleware = require('../middleware/ownermiddleware');
const {settime,getcurrenttime,resettime} = require('../controllers/time');

router.post('/settime',ownermiddleware,settime);
router.get('/getcurrenttime',ownermiddleware,getcurrenttime);
router.post('/resettime',ownermiddleware,resettime);

module.exports = router;