const express = require('express');
const router = express.Router();


//Create
router.post('/create',problemcreate); //Need admin access
//Fetch
router.get('/:id',problemfetch);
router.get('/',allproblemfetch);
//Update
router.patch("/:id",problemupdate); //Need admin access
//Delete
router.delete('/:id',problemdelete); //Need admin access 
//Get all problems solved so far by the user
router.get('/user',solvedproblems);