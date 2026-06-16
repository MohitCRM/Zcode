const express = require('express');
const router = express.Router();
const userauth = require('../middleware/usermiddleware');
const adminauth = require('../middleware/adminmiddleware');
const {getallannouncements,createannouncement,updateannouncement,deleteannouncement} = require('../controllers/announcement');


router.get('/all', userauth,getallannouncements);
router.post('/create',adminauth,createannouncement);
router.put('/update/:aid',adminauth,updateannouncement);
router.delete('/delete/:aid',adminauth,deleteannouncement);

module.exports =router;