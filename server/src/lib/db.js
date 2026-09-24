const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const dataDir = path.join(__dirname, '../../data');
const signupPath = path.join(dataDir, 'signup_table.json');
const loginPath = path.join(dataDir, 'login_table.json');
const coursesPath = path.join(dataDir, 'courses.json');
const frontendCoursesPath = path.join(
  __dirname,
  '../../../ceptra-infotech/app/courses/component/CourseData/db.json'
);

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

function ensureJson(filePath, fallback) {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(fallback, null, 2));
  }
}

ensureJson(signupPath, []);
ensureJson(loginPath, []);

let pgPool = null;
let usePg = false;

if (process.env.DATABASE_URL) {
  try {
    pgPool = new Pool({
      connectionString: process.env.DATABASE_URL,
      connectionTimeoutMillis: 3000,
    });
  } catch (err) {
    console.warn('PostgreSQL pool init failed, fallback to local storage:', err.message);
  }
}

function readJson(filePath, fallback) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (err) {
    return fallback;
  }
}

function writeJson(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
}

function loadCourseSource() {
  if (fs.existsSync(coursesPath)) {
    return JSON.parse(fs.readFileSync(coursesPath, 'utf8'));
  }
  if (fs.existsSync(frontendCoursesPath)) {
    return JSON.parse(fs.readFileSync(frontendCoursesPath, 'utf8'));
  }
  return { courses: [] };
}

function mapSignupRow(row) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    password: row.password,
    otp: row.otp,
    otpExpiresAt: row.otp_expires_at,
  };
}

async function initDb() {
  if (!fs.existsSync(coursesPath)) {
    writeJson(coursesPath, loadCourseSource());
  }

  if (!pgPool) {
    console.log('DATABASE_URL is not set. Using local JSON tables.');
    return;
  }

  try {
    const client = await pgPool.connect();
    await client.query(`
      CREATE TABLE IF NOT EXISTS signup (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        otp VARCHAR(10),
        otp_expires_at TIMESTAMP,
        last_login_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await client.query(`
      ALTER TABLE signup ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP;
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS login (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255),
        email VARCHAR(255) NOT NULL,
        password VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS courses (
        id SERIAL PRIMARY KEY,
        group_type VARCHAR(100) NOT NULL,
        layout VARCHAR(50),
        heading VARCHAR(255),
        see_all_href VARCHAR(255),
        sort_order INT NOT NULL DEFAULT 0,
        item_order INT NOT NULL DEFAULT 0,
        slug VARCHAR(255) NOT NULL,
        title VARCHAR(500) NOT NULL,
        image VARCHAR(500),
        tags TEXT,
        price INT NOT NULL,
        original_price INT,
        badge VARCHAR(100),
        href VARCHAR(500),
        pdfs TEXT,
        videos TEXT,
        UNIQUE (group_type, slug)
      );
    `);
    await client.query(`ALTER TABLE courses ADD COLUMN IF NOT EXISTS pdfs TEXT;`);
    await client.query(`ALTER TABLE courses ADD COLUMN IF NOT EXISTS videos TEXT;`);
    await client.query(`
      CREATE TABLE IF NOT EXISTS payments (
        id SERIAL PRIMARY KEY,
        transaction_id VARCHAR(120) UNIQUE NOT NULL,
        course_slug VARCHAR(255),
        course_title VARCHAR(500),
        student_name VARCHAR(255),
        student_email VARCHAR(255),
        student_mobile VARCHAR(40),
        amount INT,
        gateway VARCHAR(80),
        payment_method VARCHAR(120),
        payer_upi VARCHAR(255),
        status VARCHAR(30) NOT NULL DEFAULT 'SUCCESS',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS acknowledgements (
        id SERIAL PRIMARY KEY,
        student_name VARCHAR(255) NOT NULL,
        course_name VARCHAR(255) NOT NULL,
        mobile_number VARCHAR(40) NOT NULL,
        date VARCHAR(40) NOT NULL,
        accepted_terms BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    const existingCourses = await client.query('SELECT COUNT(*)::int AS count FROM courses');
    if (Number(existingCourses.rows[0].count) === 0) {
      const catalog = loadCourseSource();
      for (const [groupIndex, group] of (catalog.courses || []).entries()) {
        for (const [itemIndex, course] of (group.data || []).entries()) {
          await client.query(
            `INSERT INTO courses (
              group_type, layout, heading, see_all_href, sort_order, item_order,
              slug, title, image, tags, price, original_price, badge, href, pdfs, videos
            ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
            ON CONFLICT (group_type, slug) DO NOTHING`,
            [
              group.type,
              group.layout || 'vertical',
              group.heading || null,
              group.seeAllHref || null,
              groupIndex,
              itemIndex,
              course.slug,
              course.title,
              course.image || null,
              JSON.stringify(course.tags || []),
              course.price,
              course.originalPrice ?? null,
              course.badge || null,
              course.href || `/courses/${course.slug}`,
              JSON.stringify(course.pdfs || []),
              JSON.stringify(course.videos || []),
            ]
          );
        }
      }
    }

    await client.query(
      `INSERT INTO payments (
        transaction_id, course_slug, course_title, student_name, student_email,
        student_mobile, amount, gateway, payment_method, payer_upi, status, created_at
      ) VALUES
        ('428900112233', 'lwc', 'LWC', 'Rahul Sharma', 'rahul.sharma@example.com', '9876543210', 20000, 'paytm', 'Paytm QR UPI', 'rahul@paytm', 'SUCCESS', NOW() - INTERVAL '2 days'),
        ('598210398214', 'marketing-cloud-engagement', 'Marketing Cloud Engagement', 'Priya Patel', 'priya.p@example.com', '9123456780', 32000, 'razorpay', 'Razorpay UPI', 'priya@okhdfcbank', 'SUCCESS', NOW() - INTERVAL '12 hours'),
        ('998877665544', 'sfmc-next-live-class', 'SFMC Next Live Class', 'Amit Verma', 'amit.verma@example.com', '9988776655', 22500, 'bank_transfer', 'Bank NEFT Transfer', 'Amit Verma (ICICI A/C)', 'SUCCESS', NOW() - INTERVAL '5 hours')
      ON CONFLICT (transaction_id) DO NOTHING`
    );

    client.release();
    usePg = true;
    console.log('PostgreSQL tables ready: signup, login, courses, payments');
  } catch (err) {
    console.warn('PostgreSQL connection failed, using file database:', err.message);
    usePg = false;
  }
}

const ready = initDb().catch((e) => console.warn('DB init warning:', e.message));

async function findUserByEmail(email) {
  const normalizedEmail = email.trim().toLowerCase();

  if (usePg && pgPool) {
    try {
      const res = await pgPool.query('SELECT * FROM signup WHERE LOWER(email) = $1', [normalizedEmail]);
      if (res.rows.length > 0) return mapSignupRow(res.rows[0]);
      return null;
    } catch (err) {
      console.warn('PG query error, fallback to JSON:', err.message);
    }
  }

  const users = readJson(signupPath, []);
  return users.find((u) => u.email.toLowerCase() === normalizedEmail) || null;
}

async function createUser({ name, email, password }) {
  const normalizedEmail = email.trim().toLowerCase();

  if (usePg && pgPool) {
    try {
      const res = await pgPool.query(
        'INSERT INTO signup (name, email, password) VALUES ($1, $2, $3) RETURNING *',
        [name.trim(), normalizedEmail, password]
      );
      const row = res.rows[0];
      return { id: row.id, name: row.name, email: row.email };
    } catch (err) {
      console.warn('PG insert error, fallback to JSON:', err.message);
    }
  }

  const users = readJson(signupPath, []);
  const newUser = {
    id: Date.now().toString(),
    name: name.trim(),
    email: normalizedEmail,
    password,
    otp: null,
    otpExpiresAt: null,
    createdAt: new Date().toISOString(),
  };
  users.push(newUser);
  writeJson(signupPath, users);
  return { id: newUser.id, name: newUser.name, email: newUser.email };
}

async function updateUserOtp(email, otp, expiresAtMs = 5 * 60 * 1000) {
  const normalizedEmail = email.trim().toLowerCase();
  const expiresAt = new Date(Date.now() + expiresAtMs);

  if (usePg && pgPool) {
    try {
      await pgPool.query(
        'UPDATE signup SET otp = $1, otp_expires_at = $2, updated_at = NOW() WHERE LOWER(email) = $3',
        [otp, expiresAt, normalizedEmail]
      );
    } catch (err) {
      console.warn('PG update OTP error, fallback to JSON:', err.message);
    }
  }

  const users = readJson(signupPath, []);
  const idx = users.findIndex((u) => u.email.toLowerCase() === normalizedEmail);
  if (idx !== -1) {
    users[idx].otp = otp;
    users[idx].otpExpiresAt = expiresAt.toISOString();
    writeJson(signupPath, users);
  }
}

async function updateUserPassword(email, newPassword) {
  const normalizedEmail = email.trim().toLowerCase();
  let updated = false;

  if (usePg && pgPool) {
    try {
      const res = await pgPool.query(
        'UPDATE signup SET password = $1, otp = NULL, otp_expires_at = NULL, updated_at = NOW() WHERE LOWER(email) = $2',
        [newPassword, normalizedEmail]
      );
      updated = res.rowCount > 0;
    } catch (err) {
      console.warn('PG update pass error, fallback to JSON:', err.message);
    }
  }

  const users = readJson(signupPath, []);
  const idx = users.findIndex((u) => u.email.toLowerCase() === normalizedEmail);
  if (idx !== -1) {
    users[idx].password = newPassword;
    users[idx].otp = null;
    users[idx].otpExpiresAt = null;
    writeJson(signupPath, users);
    updated = true;
  }

  return updated;
}

async function updateUserLastLogin(email) {
  const normalizedEmail = email.trim().toLowerCase();

  if (usePg && pgPool) {
    try {
      await pgPool.query(
        'UPDATE signup SET last_login_at = NOW(), updated_at = NOW() WHERE LOWER(email) = $1',
        [normalizedEmail]
      );
    } catch (err) {
      console.warn('PG update last login error, fallback to JSON:', err.message);
    }
  }

  const users = readJson(signupPath, []);
  const idx = users.findIndex((u) => u.email.toLowerCase() === normalizedEmail);
  if (idx !== -1) {
    users[idx].lastLoginAt = new Date().toISOString();
    writeJson(signupPath, users);
  }
}

async function recordLogin({ name, email, password }) {
  const normalizedEmail = email.trim().toLowerCase();
  const entry = {
    id: Date.now().toString(),
    name: name || null,
    email: normalizedEmail,
    password: password || null,
    createdAt: new Date().toISOString(),
  };

  if (usePg && pgPool) {
    try {
      const res = await pgPool.query(
        'INSERT INTO login (name, email, password) VALUES ($1, $2, $3) RETURNING id, created_at',
        [entry.name, normalizedEmail, entry.password]
      );
      entry.id = res.rows[0].id;
      entry.createdAt = res.rows[0].created_at;
    } catch (err) {
      console.warn('PG login insert error, fallback to JSON:', err.message);
    }
  }

  const rows = readJson(loginPath, []);
  rows.push(entry);
  writeJson(loginPath, rows);
  return { id: entry.id, name: entry.name, email: entry.email, createdAt: entry.createdAt };
}

const COURSE_GROUPS = [
  { type: 'new-courses', layout: 'vertical', heading: 'New courses', seeAllHref: null },
  { type: 'recent-courses', layout: 'horizontal', heading: 'Recent courses', seeAllHref: '/courses' },
  { type: 'featured-courses', layout: 'horizontal', heading: 'Featured courses', seeAllHref: '/courses' },
];

function parseJsonList(value) {
  if (Array.isArray(value)) return value;
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function slugify(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 180);
}

function normalizeMediaList(items, kind, limit = 4) {
  return (Array.isArray(items) ? items : [])
    .map((item, index) => ({
      id: item.id || `${kind}-${index + 1}`,
      name: String(item.name || `${kind === 'pdf' ? 'PDF' : 'Video'} ${index + 1}`).trim(),
      url: String(item.url || '').trim(),
      duration: item.duration || undefined,
      fileSize: item.fileSize || item.file_size || undefined,
      description: item.description || undefined,
    }))
    .filter((item) => item.name && item.url)
    .slice(0, limit);
}

function mapCourseRow(row) {
  const title = row.title;
  const slug = row.slug;
  const pdfs = parseJsonList(row.pdfs);
  const videos = parseJsonList(row.videos);
  return {
    slug,
    title,
    image: row.image,
    tags: typeof row.tags === 'string' ? parseJsonList(row.tags) : row.tags || [],
    price: row.price,
    originalPrice: row.original_price ?? row.originalPrice ?? undefined,
    badge: row.badge || undefined,
    href: row.href || `/courses/${slug}`,
    pdfs,
    videos,
    groupType: row.group_type || row.type,
    layout: row.layout,
    heading: row.heading,
    seeAllHref: row.see_all_href ?? row.seeAllHref ?? null,
    id: row.id,
  };
}

function groupCourseRows(rows) {
  const groups = [];
  const indexByType = new Map();

  for (const row of rows) {
    if (!indexByType.has(row.group_type || row.type)) {
      const group = {
        type: row.group_type || row.type,
        layout: row.layout || 'vertical',
        heading: row.heading || 'Courses',
        seeAllHref: row.see_all_href ?? row.seeAllHref ?? null,
        data: [],
      };
      indexByType.set(group.type, groups.length);
      groups.push(group);
    }

    const course = mapCourseRow(row);
    groups[indexByType.get(row.group_type || row.type)].data.push({
      slug: course.slug,
      title: course.title,
      image: course.image,
      tags: course.tags,
      price: course.price,
      originalPrice: course.originalPrice,
      badge: course.badge,
      href: course.href,
      pdfs: course.pdfs,
      videos: course.videos,
    });
  }

  return groups;
}

async function getCourses() {
  if (usePg && pgPool) {
    try {
      const res = await pgPool.query(
        'SELECT * FROM courses ORDER BY sort_order ASC, item_order ASC, id ASC'
      );
      if (res.rows.length > 0) {
        return { courses: groupCourseRows(res.rows) };
      }
    } catch (err) {
      console.warn('PG courses query error, fallback to JSON:', err.message);
    }
  }

  const catalog = readJson(coursesPath, loadCourseSource());
  return {
    courses: (catalog.courses || []).map((group) => ({
      ...group,
      data: (group.data || []).map((course) => mapCourseRow(course)),
    })),
  };
}

async function getCourseBySlug(slug) {
  const rawSlug = String(slug || '').trim();
  const normalized = slugify(rawSlug);
  if (usePg && pgPool) {
    try {
      const res = await pgPool.query(
        'SELECT * FROM courses WHERE LOWER(slug) = LOWER($1) OR LOWER(slug) = LOWER($2) ORDER BY sort_order ASC, item_order ASC LIMIT 1',
        [normalized, rawSlug]
      );
      if (res.rows[0]) return mapCourseRow(res.rows[0]);
    } catch (err) {
      console.warn('PG course lookup error, fallback to JSON:', err.message);
    }
  }

  const catalog = await getCourses();
  for (const group of catalog.courses) {
    const match = group.data.find(
      (course) =>
        String(course.slug || '').toLowerCase() === normalized.toLowerCase() ||
        String(course.slug || '').toLowerCase() === rawSlug.toLowerCase()
    );
    if (match) return match;
  }
  return null;
}

async function saveCourseRecord(course, groups = COURSE_GROUPS) {
  const slug = slugify(course.slug || course.title);
  const title = String(course.title || '').trim();
  const pdfs = normalizeMediaList(course.pdfs, 'pdf');
  const videos = normalizeMediaList(course.videos, 'video');
  const record = {
    slug,
    title,
    image: course.image || '/courses/new-course/1.webp',
    tags: Array.isArray(course.tags)
      ? course.tags
      : String(course.tags || '').split(',').map((tag) => tag.trim()).filter(Boolean),
    price: Number(course.price) || 0,
    originalPrice: course.originalPrice === '' || course.originalPrice == null
      ? null
      : Number(course.originalPrice),
    badge: course.badge || null,
    href: `/courses/${slug}`,
    pdfs,
    videos,
  };

  if (!record.title || !record.slug) {
    throw new Error('Course title is required.');
  }

  if (usePg && pgPool) {
    for (const [groupIndex, group] of groups.entries()) {
      const order = await pgPool.query(
        'SELECT COALESCE(MAX(item_order), -1) + 1 AS next_order FROM courses WHERE group_type = $1',
        [group.type]
      );
      await pgPool.query(
        `INSERT INTO courses (
          group_type, layout, heading, see_all_href, sort_order, item_order,
          slug, title, image, tags, price, original_price, badge, href, pdfs, videos
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
        ON CONFLICT (group_type, slug) DO UPDATE SET
          title = EXCLUDED.title,
          image = EXCLUDED.image,
          tags = EXCLUDED.tags,
          price = EXCLUDED.price,
          original_price = EXCLUDED.original_price,
          badge = EXCLUDED.badge,
          href = EXCLUDED.href,
          pdfs = EXCLUDED.pdfs,
          videos = EXCLUDED.videos`,
        [
          group.type,
          group.layout,
          group.heading,
          group.seeAllHref,
          groupIndex,
          order.rows[0].next_order,
          record.slug,
          record.title,
          record.image,
          JSON.stringify(record.tags),
          record.price,
          record.originalPrice,
          record.badge,
          record.href,
          JSON.stringify(record.pdfs),
          JSON.stringify(record.videos),
        ]
      );
    }
  }

  const catalog = readJson(coursesPath, { courses: [] });
  for (const group of groups) {
    let bucket = (catalog.courses || []).find((item) => item.type === group.type);
    if (!bucket) {
      bucket = { ...group, data: [] };
      catalog.courses = [...(catalog.courses || []), bucket];
    }
    const index = bucket.data.findIndex((item) => item.slug === record.slug);
    const stored = {
      slug: record.slug,
      title: record.title,
      image: record.image,
      tags: record.tags,
      price: record.price,
      originalPrice: record.originalPrice || undefined,
      badge: record.badge || undefined,
      href: record.href,
      pdfs: record.pdfs,
      videos: record.videos,
    };
    if (index === -1) bucket.data.push(stored);
    else bucket.data[index] = stored;
  }
  writeJson(coursesPath, catalog);
  return record;
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = '';
  let quoted = false;
  const source = String(text || '').replace(/^\uFEFF/, '');

  for (let index = 0; index < source.length; index += 1) {
    const char = source[index];
    if (quoted) {
      if (char === '"' && source[index + 1] === '"') {
        cell += '"';
        index += 1;
      } else if (char === '"') {
        quoted = false;
      } else {
        cell += char;
      }
    } else if (char === '"') {
      quoted = true;
    } else if (char === ',') {
      row.push(cell);
      cell = '';
    } else if (char === '\n') {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = '';
    } else if (char !== '\r') {
      cell += char;
    }
  }
  if (cell || row.length) {
    row.push(cell);
    rows.push(row);
  }
  return rows.filter((item) => item.some((value) => String(value).trim()));
}

function splitMediaCell(value, kind) {
  return String(value || '')
    .split(';')
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part, index) => {
      const [name, url, extra] = part.split('|').map((piece) => piece.trim());
      return {
        id: `${kind}-${index + 1}`,
        name,
        url,
        duration: kind === 'video' ? extra : undefined,
        fileSize: kind === 'pdf' ? extra : undefined,
      };
    });
}

async function createCoursesFromCsv(csvText) {
  const rows = parseCsv(csvText);
  if (rows.length < 2) throw new Error('CSV must include a header and at least one course.');
  const header = rows[0].map((column) => column.trim().toLowerCase());
  const courses = [];
  const errors = [];

  for (const [index, row] of rows.slice(1).entries()) {
    const record = Object.fromEntries(header.map((column, columnIndex) => [column, row[columnIndex] || '']));
    try {
      courses.push(await saveCourseRecord({
        title: record.title,
        slug: record.slug,
        price: record.price,
        originalPrice: record.original_price || record.originalprice,
        image: record.image,
        tags: record.tags,
        badge: record.badge,
        pdfs: splitMediaCell(record.pdfs, 'pdf'),
        videos: splitMediaCell(record.videos, 'video'),
      }));
    } catch (error) {
      errors.push({ row: index + 2, message: error.message });
    }
  }

  if (!courses.length) {
    throw new Error(errors[0]?.message || 'No courses were imported.');
  }
  return { courses, errors };
}

async function createCoursesFromItems(items) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error('Please provide at least one course in the Excel sheet.');
  }
  const courses = [];
  const errors = [];

  for (const [index, record] of items.entries()) {
    try {
      const rawTitle = record.title || record.Title || record['Course Title'] || record['course_title'];
      const rawSlug = record.slug || record.Slug;
      const rawPrice = record.price ?? record.Price;
      const rawOriginalPrice = record.original_price ?? record.originalPrice ?? record.originalPrice ?? record['Original Price'];
      const rawImage = record.image || record.Image;
      const rawTags = record.tags || record.Tags;
      const rawBadge = record.badge || record.Badge;
      const rawPdfs = record.pdfs || record.PDFs || record.pdfs;
      const rawVideos = record.videos || record.Videos || record.videos;

      const pdfs = Array.isArray(rawPdfs)
        ? rawPdfs
        : typeof rawPdfs === 'string'
        ? splitMediaCell(rawPdfs, 'pdf')
        : [];
      const videos = Array.isArray(rawVideos)
        ? rawVideos
        : typeof rawVideos === 'string'
        ? splitMediaCell(rawVideos, 'video')
        : [];

      courses.push(
        await saveCourseRecord({
          title: rawTitle,
          slug: rawSlug,
          price: rawPrice,
          originalPrice: rawOriginalPrice,
          image: rawImage,
          tags: rawTags,
          badge: rawBadge,
          pdfs,
          videos,
        })
      );
    } catch (error) {
      errors.push({ row: index + 2, message: error.message });
    }
  }

  if (!courses.length) {
    throw new Error(errors[0]?.message || 'No courses were imported.');
  }
  return { courses, errors };
}

function paginate(items, page, pageSize) {
  const size = Math.min(Math.max(Number(pageSize) || 8, 1), 50);
  const current = Math.max(Number(page) || 1, 1);
  const start = (current - 1) * size;
  return {
    items: items.slice(start, start + size),
    total: items.length,
    page: current,
    pageSize: size,
    totalPages: Math.max(Math.ceil(items.length / size), 1),
  };
}

function matchesQuery(record, query) {
  const needle = String(query || '').trim().toLowerCase();
  if (!needle) return true;
  return JSON.stringify(record).toLowerCase().includes(needle);
}

async function listSignups() {
  if (usePg && pgPool) {
    const res = await pgPool.query(
      'SELECT id, name, email, last_login_at, created_at, updated_at FROM signup ORDER BY created_at DESC'
    );
    return res.rows;
  }
  return readJson(signupPath, []).map(({ password, otp, ...user }) => user);
}

async function listLogins() {
  if (usePg && pgPool) {
    const res = await pgPool.query(
      'SELECT id, name, email, created_at FROM login ORDER BY created_at DESC'
    );
    return res.rows;
  }
  return readJson(loginPath, []).map(({ password, ...entry }) => entry);
}

async function listCourseRows() {
  const rawRows = usePg && pgPool
    ? (await pgPool.query('SELECT * FROM courses ORDER BY sort_order ASC, item_order ASC, id ASC')).rows.map(mapCourseRow)
    : (await getCourses()).courses.flatMap((group) =>
      group.data.map((course) => ({ ...course, groupType: group.type || group.heading, heading: group.heading }))
    );

  const unique = new Map();
  for (const row of rawRows) {
    const slugKey = (row.slug || row.title || '').trim().toLowerCase();
    if (!slugKey) continue;

    const newKeys = String(row.groupType || row.heading || '').split(',').map((s) => s.trim()).filter(Boolean);
    const existing = unique.get(slugKey);

    if (!existing) {
      const keysSet = new Set(newKeys);
      unique.set(slugKey, {
        ...row,
        keys: Array.from(keysSet),
        groupType: Array.from(keysSet).join(', '),
      });
    } else {
      const currentKeys = existing.keys || String(existing.groupType || '').split(',').map((s) => s.trim()).filter(Boolean);
      newKeys.forEach((k) => {
        if (k && !currentKeys.includes(k)) currentKeys.push(k);
      });
      existing.keys = currentKeys;
      existing.groupType = currentKeys.join(', ');

      if ((!existing.pdfs || existing.pdfs.length === 0) && row.pdfs && row.pdfs.length > 0) {
        existing.pdfs = row.pdfs;
      }
      if ((!existing.videos || existing.videos.length === 0) && row.videos && row.videos.length > 0) {
        existing.videos = row.videos;
      }
      if (!existing.badge && row.badge) {
        existing.badge = row.badge;
      }
    }
  }
  return [...unique.values()];
}

async function listPayments() {
  if (usePg && pgPool) {
    const res = await pgPool.query(
      `SELECT * FROM payments WHERE status = 'SUCCESS' ORDER BY created_at DESC`
    );
    return res.rows;
  }
  return readJson(path.join(dataDir, 'payments.json'), []).filter((payment) => payment.status === 'SUCCESS');
}

async function recordPayment(payment) {
  const entry = {
    transaction_id: String(payment.transactionId || '').trim(),
    course_slug: payment.courseSlug || null,
    course_title: payment.courseTitle || null,
    student_name: payment.studentName || null,
    student_email: payment.studentEmail || null,
    student_mobile: payment.studentMobile || null,
    amount: Number(payment.amount) || 0,
    gateway: payment.gateway || null,
    payment_method: payment.paymentMethod || null,
    payer_upi: payment.payerUpi || null,
    status: 'SUCCESS',
    created_at: new Date().toISOString(),
  };
  if (!entry.transaction_id) throw new Error('Transaction ID is required.');

  if (usePg && pgPool) {
    try {
      await pgPool.query(
        `INSERT INTO payments (
          transaction_id, course_slug, course_title, student_name, student_email,
          student_mobile, amount, gateway, payment_method, payer_upi, status
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
        ON CONFLICT (transaction_id) DO NOTHING`,
        [
          entry.transaction_id,
          entry.course_slug,
          entry.course_title,
          entry.student_name,
          entry.student_email,
          entry.student_mobile,
          entry.amount,
          entry.gateway,
          entry.payment_method,
          entry.payer_upi,
          entry.status,
        ]
      );
    } catch (err) {
      console.warn('PG payment insert error, fallback to JSON:', err.message);
    }
  }

  const filePath = path.join(dataDir, 'payments.json');
  const rows = readJson(filePath, []);
  const index = rows.findIndex((p) => p.transaction_id === entry.transaction_id);
  if (index >= 0) {
    rows[index] = entry;
  } else {
    rows.unshift(entry);
  }
  writeJson(filePath, rows);
  return entry;
}

async function listAcknowledgements() {
  if (usePg && pgPool) {
    const res = await pgPool.query(
      `SELECT * FROM acknowledgements ORDER BY created_at DESC`
    );
    return res.rows;
  }
  return readJson(path.join(dataDir, 'acknowledgements.json'), []);
}

async function recordAcknowledgement(ack) {
  const entry = {
    id: Date.now().toString(),
    student_name: String(ack.studentName || ack.student_name || '').trim(),
    course_name: String(ack.courseName || ack.course_name || '').trim(),
    mobile_number: String(ack.mobileNumber || ack.mobile_number || '').trim(),
    date: String(ack.date || new Date().toISOString().slice(0, 10)).trim(),
    accepted_terms: true,
    created_at: new Date().toISOString(),
  };

  if (!entry.student_name || !entry.course_name || !entry.mobile_number) {
    throw new Error('Student name, course name, and mobile number are required.');
  }

  if (usePg && pgPool) {
    try {
      const res = await pgPool.query(
        `INSERT INTO acknowledgements (
          student_name, course_name, mobile_number, date, accepted_terms
        ) VALUES ($1,$2,$3,$4,$5) RETURNING *`,
        [entry.student_name, entry.course_name, entry.mobile_number, entry.date, entry.accepted_terms]
      );
      entry.id = res.rows[0].id;
      entry.created_at = res.rows[0].created_at;
    } catch (err) {
      console.warn('PG acknowledgement insert error, fallback to JSON:', err.message);
    }
  }

  const filePath = path.join(dataDir, 'acknowledgements.json');
  const rows = readJson(filePath, []);
  rows.unshift(entry);
  writeJson(filePath, rows);
  return entry;
}

module.exports = {
  ready,
  findUserByEmail,
  createUser,
  updateUserOtp,
  updateUserPassword,
  updateUserLastLogin,
  recordLogin,
  getCourses,
  getCourseBySlug,
  saveCourseRecord,
  createCoursesFromCsv,
  createCoursesFromItems,
  listSignups,
  listLogins,
  listCourseRows,
  listPayments,
  recordPayment,
  listAcknowledgements,
  recordAcknowledgement,
  paginate,
  matchesQuery,
};
