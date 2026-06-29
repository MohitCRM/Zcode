const express = require('express');
const router = express.Router();
const adminmiddleware = require('../middleware/adminmiddleware');
const usermiddleware = require('../middleware/usermiddleware');
const phasemiddleware = require('../middleware/phaseguard');
const {showallseasons,createseason,updateseason,deleteseason,getcurrentseason,getseasonbyid} = require('../controllers/seasons');

router.post('/create',adminmiddleware,createseason);
router.put('/update/:sid',adminmiddleware,updateseason);
router.delete('/delete/:sid',adminmiddleware,deleteseason);
router.get('/getallseasons',usermiddleware,showallseasons);
router.get('/getcurrentseason',phasemiddleware(['Round1', 'Round2', 'Round1Solution', 'Round2Solution']), getcurrentseason);
router.get('/getseasonbyid/:sid',usermiddleware, getseasonbyid);

module.exports = router;