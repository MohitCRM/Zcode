const express = require("express");
const {register,login,logout,adminregister} = require("../controllers/userauth");
const usermiddleware = require('../middleware/user');
const adminmiddleware = require('../middleware/adminpower');

const router = express.Router();

router.post('/register',register);

router.post('/login',login);

router.post('/logout',usermiddleware, logout);

router.post('/admin/register', adminmiddleware,adminregister);

router.get('/getProfile',getProfile);

module.exports = router;