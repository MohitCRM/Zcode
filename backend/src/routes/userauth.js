const express = require("express");
const {register,login,logout,guestregister,deleteprofile,checkauth,exitguestmode,getallusers,makeadmin} = require("../controllers/userauth");
const usermiddleware = require('../middleware/usermiddleware');
const adminmiddleware = require('../middleware/adminmiddleware');


const router = express.Router();

router.post('/register',register);

router.post('/login',login);

router.post('/logout',usermiddleware, logout);

router.post('/guest/login', guestregister);

router.delete('/profile/delete',usermiddleware,deleteprofile);

router.get('/checkauth',usermiddleware,checkauth);

router.delete('/guest/exit', usermiddleware, exitguestmode);

router.get('/admin/users', adminmiddleware, getallusers);
router.put('/admin/makeadmin', adminmiddleware, makeadmin);

module.exports = router;