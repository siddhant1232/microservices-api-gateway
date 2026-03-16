const express = require('express');
const router = express.Router();
const { getProfile, updateProfile, deleteUser } = require('../controllers/userController');

router.get('/:id/profile', getProfile);
router.put('/:id/profile', updateProfile);
router.delete('/:id', deleteUser);

module.exports = router;
