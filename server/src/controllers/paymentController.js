const db = require('../lib/db');

exports.recordPayment = async (req, res) => {
  try {
    await db.ready;
    const payment = await db.recordPayment(req.body || {});
    return res.status(201).json({ success: true, payment });
  } catch (error) {
    console.error('Record payment error:', error);
    return res.status(400).json({
      success: false,
      message: error.message || 'Unable to save payment.',
    });
  }
};
