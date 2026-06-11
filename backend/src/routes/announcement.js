const express = require('express');
const router = express.router();
const userauth = require('../middleware/usermiddleware');
const adminauth = require('../middleware/adminmiddleware');
const {getallannouncements,createannouncement,updateannouncement,deleteannouncement} = require('../controllers/announcement');


router.get('/all', userauth,getallannouncements);
router.post('admin/create',adminauth,createannouncement);
router.put('admin/update/:aid',adminauth,updateannouncement);
router.delete('admin/delete/:aid',adminauth,deleteannouncement);

module.exports =router;