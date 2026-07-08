const express = require('express');
const router = express.Router();
const {problemchatai} = require('../controllers/ai');
router.post('/problemchatai',problemchatai);

module.exports = router;