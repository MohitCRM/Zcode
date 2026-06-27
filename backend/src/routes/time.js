const express = require('express');
const router = express.Router();
const adminauth = require('../middleware/adminmiddleware');
const {settime,getcurrenttime,resettime} = require('../controllers/time');

router.post('/settime',adminauth,settime);
router.get('/getcurrenttime',adminauth,getcurrenttime);
router.post('/resettime',adminauth,resettime);

module.exports = router;