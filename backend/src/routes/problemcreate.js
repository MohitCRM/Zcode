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
    sumbittedproblem
} = require('../controllers/userproblem');

router.post('/create', adminmiddleware, createproblem);
router.put("/update/:pid", adminmiddleware, problemupdate);
router.delete('/delete/:pid', adminmiddleware, problemdelete);

router.get('/:pid', usermiddleware, phasemiddleware(['Round1', 'Round2', 'Round1Solution', 'Round2Solution']), problemfetch);

router.get('/', usermiddleware, phasemiddleware(['Round1' , 'Round2']) ,allproblemfetch);

router.get('/user', usermiddleware, solvedproblems);
router.get("/submittedProblem/:pid", usermiddleware, sumbittedproblem);

module.exports = router;