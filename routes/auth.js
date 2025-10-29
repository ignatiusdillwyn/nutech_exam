const express = require('express');
const {
//   register,
  login,
//   getProfile,
//   updateProfile,
//   updateProfileImage
} = require('../controllers/authController');
// const { authenticateToken } = require('../middleware/auth');
// const {
//   registerValidation,
//   loginValidation
// } = require('../middleware/validation');

const router = express.Router();

// router.post('/registration', registerValidation, register);
router.post('/login', login);
// router.get('/profile', authenticateToken, getProfile);
// router.put('/profile/update', authenticateToken, updateProfile);
// router.put('/profile/image', authenticateToken, updateProfileImage);

module.exports = router;