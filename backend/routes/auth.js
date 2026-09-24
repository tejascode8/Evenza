const express = require('express');
const router = express.Router();
const { register, login, verifyOTP, registerAdmin } = require('../controllers/authController');

router.post('/register', register);
router.post('/login', login);
router.post('/verify-otp', verifyOTP);
router.post('/register-admin', registerAdmin);

module.exports = router;

