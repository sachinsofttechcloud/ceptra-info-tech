const express = require('express');
const router = express.Router();
const db = require('../lib/db');

router.post('/', async (req, res) => {
  try {
    await db.ready;
    const { studentName, courseName, mobileNumber, date, acceptedTerms } = req.body;
    if (!studentName || !courseName || !mobileNumber) {
      return res.status(400).json({
        success: false,
        message: 'Student Name, Course Name, and Mobile Number are required.',
      });
    }

    const record = await db.recordAcknowledgement({
      studentName,
      courseName,
      mobileNumber,
      date,
      acceptedTerms,
    });

    return res.status(200).json({
      success: true,
      message: 'Student Declaration & Acknowledgement submitted successfully!',
      data: record,
    });
  } catch (err) {
    console.error('Error submitting acknowledgement:', err);
    return res.status(500).json({
      success: false,
      message: err.message || 'Server error submitting acknowledgement.',
    });
  }
});

module.exports = router;
