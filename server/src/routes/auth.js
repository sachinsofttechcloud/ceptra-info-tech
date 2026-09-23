const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/forgot-password/send-otp', authController.sendOtp);
router.post('/forgot-password/verify-otp', authController.verifyOtp);
router.post('/forgot-password/reset-password', authController.resetPassword);

module.exports = router;
