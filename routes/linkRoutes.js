const express = require('express');
const router = express.Router();
const linkController = require('../controllers/linkController');

router.get('/generate', linkController.generateLink);
router.get('/link/:shortUrl', linkController.processLink);

module.exports = router;
