const db = require('../lib/db');

const ADMIN_EMAILS = ['chandan@ceptrainfotech.com', 'chandan.sakure@gmail.com'];

function isAdmin(req) {
  const email = String(req.headers['x-admin-email'] || '').trim().toLowerCase();
  return ADMIN_EMAILS.includes(email);
}

function denyAdmin(res) {
  return res.status(403).json({
    success: false,
    message: 'This action is available only for the Ceptra admin emails.',
  });
}

exports.listCourses = async (_req, res) => {
  try {
    await db.ready;
    const catalog = await db.getCourses();
    return res.status(200).json({
      success: true,
      courses: catalog.courses,
    });
  } catch (error) {
    console.error('List courses error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error loading courses.',
    });
  }
};

exports.getCourse = async (req, res) => {
  try {
    await db.ready;
    const course = await db.getCourseBySlug(req.params.slug);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found.' });
    }
    return res.status(200).json({ success: true, course });
  } catch (error) {
    console.error('Get course error:', error);
    return res.status(500).json({ success: false, message: 'Server error loading course.' });
  }
};

exports.createCourse = async (req, res) => {
  try {
    if (!isAdmin(req)) return denyAdmin(res);
    await db.ready;
    const course = await db.saveCourseRecord(req.body || {});
    return res.status(201).json({ success: true, message: 'Course saved.', course });
  } catch (error) {
    console.error('Create course error:', error);
    return res.status(400).json({ success: false, message: error.message || 'Unable to save course.' });
  }
};

exports.bulkCreateCourses = async (req, res) => {
  try {
    if (!isAdmin(req)) return denyAdmin(res);
    await db.ready;
    const { csv, courses } = req.body || {};
    let result;

    if (Array.isArray(courses) && courses.length > 0) {
      result = await db.createCoursesFromItems(courses);
    } else if (csv && typeof csv === 'string') {
      result = await db.createCoursesFromCsv(csv);
    } else {
      return res.status(400).json({ success: false, message: 'Upload an Excel (.xlsx) or CSV file containing courses.' });
    }

    return res.status(201).json({
      success: true,
      message: `${result.courses.length} course${result.courses.length === 1 ? '' : 's'} imported successfully.`,
      count: result.courses.length,
      courses: result.courses,
      errors: result.errors,
    });
  } catch (error) {
    console.error('Bulk course error:', error);
    return res.status(400).json({ success: false, message: error.message || 'Unable to import courses.' });
  }
};
