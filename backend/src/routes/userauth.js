const express = require("express");
const {register,login,logout,guestregister,deleteprofile,checkauth,exitguestmode,getallusers,makeadmin,removeadmin,admindeleteuser} = require("../controllers/userauth");
const usermiddleware = require('../middleware/usermiddleware');
const adminmiddleware = require('../middleware/adminmiddleware');
const ownermiddleware = require('../middleware/ownermiddleware');

const router = express.Router();

router.post('/register',register);

router.post('/login',login);

router.post('/logout',usermiddleware, logout);

router.post('/guest/login', guestregister);

router.delete('/profile/delete',usermiddleware,deleteprofile);

router.get('/checkauth',usermiddleware,checkauth);

router.delete('/guest/exit', usermiddleware, exitguestmode);

router.get('/admin/showallusers', adminmiddleware, getallusers);
router.put('/admin/makeadmin', ownermiddleware, makeadmin);
router.put('/admin/removeadmin', ownermiddleware, removeadmin);
router.delete('/admin/deleteuser/:id', adminmiddleware, admindeleteuser);


module.exports = router;