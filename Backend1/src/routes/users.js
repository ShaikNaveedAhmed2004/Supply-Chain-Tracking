const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');
const validateRole = require('../middleware/validateRole');
const { ROLES } = require('../config/constants');

// Profile routes
router.get('/profile', auth, userController.getProfile);
router.put('/profile/email', auth, userController.updateEmail);
router.put('/profile/password', auth, userController.updatePassword);
router.get('/activity', auth, userController.getUserActivity);

// Admin routes
router.get('/', [auth, validateRole([ROLES.ADMIN])], userController.getAllUsers);
router.put('/:id/status', [auth, validateRole([ROLES.ADMIN])], userController.updateUserStatus);
router.put('/:id/role', [auth, validateRole([ROLES.ADMIN])], userController.updateUserRole);

module.exports = router;
