'use strict';

// requirements and variable declarations
const { Router } = require('express');
const router = Router();
const authRoutes = require('../routes/auth');

router.use('/auth', authRoutes);