const express = require('express');
const healthRoutes = require('./health.routes');

const router = express.Router();

router.use(healthRoutes);
router.use('/auth', require('./auth.routes'));
router.use('/scores', require('./scores.routes'));

module.exports = router;