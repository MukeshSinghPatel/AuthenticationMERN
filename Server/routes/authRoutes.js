const express = require('express');
const { authRegister, authLogin, authLogout, sendVerifyOtp, verifyEmail, isAuthenticated, sendResetOtp, resetPassword } = require('../controllers/authController');
const { authMiddleware } = require('../middleware/auth');
const router = express.Router();

router.post('/register', authRegister);
router.post('/login', authLogin);
router.post('/logout', authLogout);
router.post('/send-verify-otp', authMiddleware, sendVerifyOtp);
router.post('/verify-account', authMiddleware, verifyEmail);
router.get('/is-auth', authMiddleware, isAuthenticated);

router.post('/send-reset-otp', sendResetOtp);
router.post('/reset-password', resetPassword);

module.exports = router;