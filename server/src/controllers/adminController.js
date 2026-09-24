const db = require('../lib/db');

const ADMIN_EMAILS = ['chandan@ceptrainfotech.com', 'chandan.sakure@gmail.com'];

function isAdmin(req) {
  const email = String(req.headers['x-admin-email'] || '').trim().toLowerCase();
  return ADMIN_EMAILS.includes(email);
}

async function sendPage(res, loader, req) {
  if (!isAdmin(req)) {
    return res.status(403).json({
      success: false,
      message: 'Admin access is limited to the authorized Ceptra emails.',
    });
  }

  await db.ready;
  const q = req.query.query || req.query.q || '';
  const rows = (await loader()).filter((row) => db.matchesQuery(row, q));
  const limit = req.query.limit || req.query.pageSize || 10;
  return res.status(200).json({
    success: true,
    ...db.paginate(rows, req.query.page, limit),
  });
}

exports.signups = (req, res) => sendPage(res, db.listSignups, req).catch((error) => {
  console.error('Admin signup list error:', error);
  res.status(500).json({ success: false, message: 'Unable to load signup data.' });
});

exports.logins = (req, res) => sendPage(res, db.listLogins, req).catch((error) => {
  console.error('Admin login list error:', error);
  res.status(500).json({ success: false, message: 'Unable to load login data.' });
});

exports.courses = (req, res) => sendPage(res, db.listCourseRows, req).catch((error) => {
  console.error('Admin course list error:', error);
  res.status(500).json({ success: false, message: 'Unable to load course data.' });
});

exports.payments = (req, res) => sendPage(res, db.listPayments, req).catch((error) => {
  console.error('Admin payment list error:', error);
  res.status(500).json({ success: false, message: 'Unable to load payment data.' });
});

exports.acknowledgements = (req, res) => sendPage(res, db.listAcknowledgements, req).catch((error) => {
  console.error('Admin acknowledgement list error:', error);
  res.status(500).json({ success: false, message: 'Unable to load acknowledgement data.' });
});
