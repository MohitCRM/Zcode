const express = require('express');
const router = express.Router();
const adminmiddleware = require('../middleware/adminmiddleware');
const {generateuploadsignature,savevideometadata,deletevideo} = require('../controllers/videosolution');

router.get('createuploadsignature',adminmiddleware,generateuploadsignature);
router.post('/save',adminmiddleware,savevideometadata);
router.delete('/delete/:videoId',adminmiddleware,deletevideo);

module.exports = router;
