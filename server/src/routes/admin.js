const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

router.get('/signups', adminController.signups);
router.get('/logins', adminController.logins);
router.get('/courses', adminController.courses);
router.get('/payments', adminController.payments);

module.exports = router;
