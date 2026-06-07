const express = require("express");
const {register,login,logout,adminregister,deleteprofile} = require("../controllers/userauth");
const usermiddleware = require('../middleware/user');
const adminmiddleware = require('../middleware/adminpower');

const router = express.Router();

router.post('/register',register);

router.post('/login',login);

router.post('/logout',usermiddleware, logout);

router.post('/admin/register', adminmiddleware,adminregister);

router.delete('/profile/delete',usermiddleware,deleteprofile);

module.exports = router;