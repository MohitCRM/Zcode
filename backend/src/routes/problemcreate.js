const express = require('express');
const router = express.Router();
const adminmiddleware = require('../middleware/adminmiddleware');
const {createproblem, problemfetch, allproblemfetch, problemupdate, problemdelete, solvedproblems} = require('../controllers/userproblem');
//Create
router.post('/create',adminmiddleware,createproblem); //Need admin access
//Fetch
router.get('/:id',problemfetch);
router.get('/',allproblemfetch);
//Update
router.patch("/:id",adminmiddleware,problemupdate); //Need admin access
//Delete
router.delete('/:id',adminmiddleware,problemdelete); //Need admin access 
//Get all problems solved so far by the user
router.get('/user',solvedproblems);

module.exports = router;