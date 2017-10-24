const express = require('express');
const router = express.Router();
const {registerUser, loginUser, getUser} = require('../controllers/authCtrl');
const authHelpers = require('../auth/_helpers');

router.post('/auth/register', registerUser);
router.post('/auth/login', loginUser);
router.get('/auth/user', authHelpers.ensureAuthenticated, getUser);

module.exports = router;