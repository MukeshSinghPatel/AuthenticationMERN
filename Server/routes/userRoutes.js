const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const { getUserData } = require('../controllers/userController');

const router = express.Router();

router.get('/data', authMiddleware, getUserData);

module.exports = router;