const express = require('express');
const router = express.Router();
const { addScore, getMyScores } = require('../controllers/scores.controller');
const { requireAuth } = require('../middleware/auth.middleware');

router.post('/', requireAuth, addScore);
router.get('/', requireAuth, getMyScores);

module.exports = router;