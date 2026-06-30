const express = require('express');
const router = express.Router();
const adminmiddleware = require('../middleware/adminmiddleware');
const usermiddleware = require('../middleware/usermiddleware');
const phasemiddleware = require('../middleware/phaseguard');
const {
    createproblem, 
    problemfetch, 
    allproblemfetch, 
    problemupdate, 
    problemdelete, 
    solvedproblems,
    sumbittedproblem,
    adminfetchallproblems,
    guestfetchallproblmes
} = require('../controllers/userproblem');

//guest routes
router.get('/guestfetchallproblems',usermiddleware,guestfetchallproblmes); 

//user routes
router.get('/getproblems', usermiddleware, phasemiddleware(['Round1', 'Round2']), allproblemfetch);
router.get('/profile/solvedproblems', usermiddleware, solvedproblems);


router.get("/submittedproblem/:pid", usermiddleware, sumbittedproblem);
router.get('/getproblembyid/:pid', usermiddleware, phasemiddleware(['Round1', 'Round2', 'Round1Solution', 'Round2Solution']), problemfetch);

// Admin routes
router.post('/create', adminmiddleware, createproblem);
router.put("/update/:pid", adminmiddleware, problemupdate);
router.delete('/delete/:pid', adminmiddleware, problemdelete);
router.get('/fetchallproblems',adminmiddleware,adminfetchallproblems);

module.exports = router;