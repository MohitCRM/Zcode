const express = require('express');
const router = express.Router();
const adminmiddleware = require('../middleware/adminmiddleware');

//Create
router.post('/create',adminmiddleware,problemcreate); //Need admin access
//Fetch
router.get('/:id',problemfetch);
router.get('/',allproblemfetch);
//Update
router.patch("/:id",adminmiddleware,problemupdate); //Need admin access
//Delete
router.delete('/:id',adminmiddleware,problemdelete); //Need admin access 
//Get all problems solved so far by the user
router.get('/user',solvedproblems);