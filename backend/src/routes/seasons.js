const express = require('express');
const router = express.Router();
const adminmiddleware = require('../middleware/adminmiddleware');
const {createseason,updateseason,deleteseason} = require('../controllers/seasons');

router.post('/create',adminmiddleware,createseason);
router.put('/update/:id',adminmiddleware,updateseason);
router.delete('/delete/:id',adminmiddleware,deleteseason);

module.exports = router;