const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');

router.get('/', courseController.listCourses);
router.post('/bulk', courseController.bulkCreateCourses);
router.post('/', courseController.createCourse);
router.get('/:slug', courseController.getCourse);

module.exports = router;
