const express = require('express');
const router = express.Router();
const adminmiddleware = require('../middleware/adminmiddleware');
const usermiddleware = require('../middleware/usermiddleware');
const {createproblem, problemfetch, allproblemfetch, problemupdate, problemdelete, solvedproblems,sumbittedproblem} = require('../controllers/userproblem');


//Create
router.post('/create',adminmiddleware,createproblem); //Need admin access
//Fetch
router.get('/:id',usermiddleware,problemfetch);
router.get('/getallproblems',allproblemfetch);
//Update
router.put("/update/:id",adminmiddleware,problemupdate); //Need admin access
//Delete
router.delete('/delete/:id',adminmiddleware,problemdelete); //Need admin access 
//Get all problems solved so far by the user
router.get('/user',usermiddleware,solvedproblems);
router.get("/submittedProblem/:pid",usermiddleware,sumbittedproblem);

module.exports = router;