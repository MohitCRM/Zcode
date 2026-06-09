const express = require("express");
const {register,login,logout,adminregister,deleteprofile,checkauth} = require("../controllers/userauth");
const usermiddleware = require('../middleware/usermiddleware');
const adminmiddleware = require('../middleware/adminmiddleware');


const router = express.Router();

router.post('/register',register);

router.post('/login',login);

router.post('/logout',usermiddleware, logout);

router.post('/admin/register', adminmiddleware,adminregister);

router.delete('/profile/delete',usermiddleware,deleteprofile);

router.get('/checkauth',usermiddleware,checkauth);

module.exports = router;