'use strict';

// requirements and variable declarations
const { Router } = require('express');
const router = Router();

router.use(require('./auth'));

module.exports = router;