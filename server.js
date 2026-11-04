const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Clean URLs: 301 redirect any .html request to clean route without .html extension
app.use((req, res, next) => {
  if (req.path.endsWith('.html') && !req.path.startsWith('/assets/')) {
    const cleanPath = req.path.replace(/\.html$/, '');
    const query = req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : '';
    if (cleanPath === '/index') {
      return res.redirect(301, '/' + query);
    }
    return res.redirect(301, cleanPath + query);
  }
  next();
});

// Helper to send PHP/HTML pages with proper text/html header
function sendPage(res, filename) {
  let filePath = path.join(__dirname, filename);
  if (!fs.existsSync(filePath)) {
    filePath = path.join(__dirname, 'public', filename);
  }
  res.type('html');
  res.sendFile(filePath);
}

// Explicit clean route handlers
app.get('/', (req, res) => sendPage(res, 'index.php'));
app.get('/wedding', (req, res) => sendPage(res, 'wedding.php'));
app.get('/services', (req, res) => sendPage(res, 'services.php'));
app.get('/career', (req, res) => sendPage(res, 'career.php'));
app.get('/work', (req, res) => sendPage(res, 'work.php'));
app.get('/contact', (req, res) => sendPage(res, 'contact.php'));
app.get('/admin', (req, res) => sendPage(res, 'admin.php'));
app.get('/gallery', (req, res) => sendPage(res, 'gallery.php'));

// Serve static frontend files (excluding /api routes)
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  express.static(__dirname, { extensions: ['html', 'php'] })(req, res, next);
});
if (fs.existsSync(path.join(__dirname, 'public'))) {
  app.use((req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    express.static(path.join(__dirname, 'public'), { extensions: ['html', 'php'] })(req, res, next);
  });
}

const DATA_FILE = path.join(__dirname, 'data', 'projects.json');
const PUBLIC_DATA_FILE = fs.existsSync(path.join(__dirname, 'public', 'projects.json')) ? path.join(__dirname, 'public', 'projects.json') : path.join(__dirname, 'projects.json');
const INQUIRIES_FILE = path.join(__dirname, 'data', 'inquiries.json');

// Ensure inquiries file exists
if (!fs.existsSync(INQUIRIES_FILE)) {
  fs.writeFileSync(INQUIRIES_FILE, JSON.stringify([], null, 2));
}

// Admin Authentication Setup
const ADMIN_USER = process.env.ADMIN_USER || 'admin';
const ADMIN_PASS = process.env.ADMIN_PASS || 'techshutter2026';
const activeTokens = new Set();

function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;
  if (!token || !activeTokens.has(token)) {
    return res.status(401).json({ success: false, message: 'Unauthorized. Admin login and password required.' });
  }
  next();
}

// Helpers
function getProjects() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    }
  } catch (err) {
    console.error('Error reading projects:', err);
  }
  return [];
}

function saveProjects(projects) {
  try {
    const json = JSON.stringify(projects, null, 2);
    fs.writeFileSync(DATA_FILE, json, 'utf8');
    fs.writeFileSync(PUBLIC_DATA_FILE, json, 'utf8');
    return true;
  } catch (err) {
    console.error('Error saving projects:', err);
    return false;
  }
}

function getInquiries() {
  try {
    if (fs.existsSync(INQUIRIES_FILE)) {
      return JSON.parse(fs.readFileSync(INQUIRIES_FILE, 'utf8'));
    }
  } catch (err) {
    console.error('Error reading inquiries:', err);
  }
  return [];
}

function saveInquiries(inquiries) {
  try {
    fs.writeFileSync(INQUIRIES_FILE, JSON.stringify(inquiries, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('Error saving inquiries:', err);
    return false;
  }
}

// ==========================================
// AUTHENTICATION ENDPOINTS
// ==========================================

app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;
  if (username === ADMIN_USER && password === ADMIN_PASS) {
    const token = crypto.randomBytes(32).toString('hex');
    activeTokens.add(token);
    console.log(`[AUTH] Admin successfully logged in from ${req.ip}`);
    return res.json({
      success: true,
      message: 'Login successful. Welcome back, Studio Director.',
      token,
      user: { username: ADMIN_USER, role: 'Administrator' }
    });
  }
  return res.status(401).json({ success: false, message: 'Invalid admin credentials. Access denied.' });
});

app.get('/api/admin/verify', (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;
  if (token && activeTokens.has(token)) {
    return res.json({ success: true, authenticated: true });
  }
  return res.status(401).json({ success: false, authenticated: false, message: 'Session expired or invalid.' });
});

app.post('/api/admin/logout', (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;
  if (token) activeTokens.delete(token);
  res.json({ success: true, message: 'Logged out successfully.' });
});

// ==========================================
// REST API ENDPOINTS
// ==========================================

// 1. Get projects (Public - filterable by category, weddingRitual, and search)
app.get('/api/projects', (req, res) => {
  let list = getProjects();
  const { category, weddingRitual, search } = req.query;

  if (category && category !== 'All') {
    list = list.filter(p => (p.category || '').toLowerCase() === category.toLowerCase());
  }

  if (weddingRitual && weddingRitual !== 'All') {
    list = list.filter(p => (p.weddingRitual || '').toLowerCase() === weddingRitual.toLowerCase());
  }

  if (search) {
    const q = search.toLowerCase();
    list = list.filter(p =>
      (p.title || '').toLowerCase().includes(q) ||
      (p.category || '').toLowerCase().includes(q) ||
      (p.weddingRitual || '').toLowerCase().includes(q) ||
      (p.description || '').toLowerCase().includes(q) ||
      (p.tags || []).some(t => t.toLowerCase().includes(q))
    );
  }

  res.json({ success: true, count: list.length, data: list });
});

// 2. Get single project (Public)
app.get('/api/projects/:id', (req, res) => {
  const list = getProjects();
  const project = list.find(p => p.id === req.params.id);
  if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
  res.json({ success: true, data: project });
});

// 3. Create project (Admin protected)
app.post('/api/projects', authMiddleware, (req, res) => {
  const { title, category, weddingRitual, description, video, image, thumbImage, photos, client, year, tags, orientation } = req.body;
  if (!title || !category) {
    return res.status(400).json({ success: false, message: 'Title and Category are required.' });
  }

  const list = getProjects();
  const photoList = Array.isArray(photos) ? photos : (image ? [image] : []);
  const mainImage = image || (photoList.length > 0 ? photoList[0] : '');

  const newProject = {
    id: 'tsh-' + Date.now().toString(36),
    title: title.trim(),
    category: category.trim(),
    weddingRitual: (weddingRitual || '').trim(),
    description: description || '',
    video: video || '',
    image: mainImage,
    thumbImage: thumbImage || mainImage,
    photos: photoList,
    orientation: orientation || 'landscape',
    client: client || 'Tech Shutter Hub Client',
    year: year || new Date().getFullYear().toString(),
    tags: Array.isArray(tags) ? tags : (tags ? tags.split(',').map(s => s.trim()) : [])
  };

  list.unshift(newProject);
  saveProjects(list);
  console.log(`[PROJECT ADDED] "${newProject.title}" in category "${newProject.category}" (Ritual: "${newProject.weddingRitual}")`);
  res.status(201).json({ success: true, message: 'Project created successfully', data: newProject });
});

// 4. Update project (Admin protected)
app.put('/api/projects/:id', authMiddleware, (req, res) => {
  const list = getProjects();
  const idx = list.findIndex(p => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ success: false, message: 'Project not found' });

  const existing = list[idx];
  const updated = {
    ...existing,
    ...req.body,
    id: existing.id // preserve ID
  };

  list[idx] = updated;
  saveProjects(list);
  res.json({ success: true, message: 'Project updated successfully', data: updated });
});

// 5. Delete project (Admin protected)
app.delete('/api/projects/:id', authMiddleware, (req, res) => {
  let list = getProjects();
  const initialLength = list.length;
  list = list.filter(p => p.id !== req.params.id);
  if (list.length === initialLength) {
    return res.status(404).json({ success: false, message: 'Project not found' });
  }
  saveProjects(list);
  res.json({ success: true, message: 'Project removed successfully' });
});

// 6. Direct Photo Upload API (Admin protected)
app.post('/api/upload', authMiddleware, async (req, res) => {
  try {
    const { filename, data } = req.body;
    if (!data) {
      return res.status(400).json({ success: false, message: 'No file data provided.' });
    }

    const matches = data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return res.status(400).json({ success: false, message: 'Invalid image data format. Expecting base64.' });
    }

    const mime = matches[1];
    let ext = mime.split('/')[1] || 'jpg';
    if (ext === 'jpeg') ext = 'jpg';

    const baseName = (filename || 'upload').replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_');
    const safeName = `${baseName}_${Date.now()}.${ext}`;

    const uploadDir = path.join(__dirname, 'public', 'assets', 'uploads');
    const optDir = path.join(__dirname, 'public', 'assets', 'optimized');
    const thumbDir = path.join(__dirname, 'public', 'assets', 'thumbs');

    fs.mkdirSync(uploadDir, { recursive: true });
    fs.mkdirSync(optDir, { recursive: true });
    fs.mkdirSync(thumbDir, { recursive: true });

    const buffer = Buffer.from(matches[2], 'base64');
    const fullPath = path.join(uploadDir, safeName);
    fs.writeFileSync(fullPath, buffer);

    let optUrl = `/assets/uploads/${safeName}`;
    let thumbUrl = `/assets/uploads/${safeName}`;
    let orientation = 'landscape';
    let width = 1600;
    let height = 1200;

    try {
      const sharp = require('sharp');
      const meta = await sharp(fullPath).metadata();
      width = meta.width;
      height = meta.height;
      orientation = height > width ? 'portrait' : 'landscape';

      const optFile = `opt_${safeName}`;
      const thumbFile = `thumb_${safeName}`;
      await sharp(fullPath).resize(1600, 1600, { fit: 'inside', withoutEnlargement: true }).jpeg({ quality: 85 }).toFile(path.join(optDir, optFile));
      await sharp(fullPath).resize(600, 600, { fit: 'inside', withoutEnlargement: true }).jpeg({ quality: 80 }).toFile(path.join(thumbDir, thumbFile));

      optUrl = `/assets/optimized/${optFile}`;
      thumbUrl = `/assets/thumbs/${thumbFile}`;
    } catch (err) {
      console.warn('Sharp optimization skipped:', err.message);
    }

    res.json({
      success: true,
      message: 'Photo uploaded and processed successfully',
      url: optUrl,
      thumbUrl: thumbUrl,
      originalUrl: `/assets/uploads/${safeName}`,
      orientation,
      width,
      height
    });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// 7. Submit Client Inquiry / Project Booking (Public)
app.post('/api/inquire', (req, res) => {
  const { name, email, phone, projectType, date, budget, message } = req.body;
  if (!name || !email) {
    return res.status(400).json({ success: false, message: 'Name and Email are required.' });
  }

  const inquiries = getInquiries();
  const newInquiry = {
    id: 'inq-' + Date.now().toString(36),
    name: name.trim(),
    email: email.trim(),
    phone: phone || '',
    projectType: projectType || 'General Inquiry',
    date: date || '',
    budget: budget || '',
    message: message || '',
    status: 'Pending',
    createdAt: new Date().toISOString()
  };

  inquiries.unshift(newInquiry);
  saveInquiries(inquiries);
  console.log(`[INQUIRY RECEIVED] From: ${newInquiry.name} (${newInquiry.email}) - Type: ${newInquiry.projectType}`);

  res.status(201).json({
    success: true,
    message: 'Thank you! Your project inquiry has been received by Tech Shutter Hub. We will be in touch shortly.',
    data: newInquiry
  });
});

// 8. Career application submission (Public)
app.post('/api/careers', (req, res) => {
  const { name, email, phone, role, portfolioUrl, experience, message } = req.body;
  if (!name || !email || !role) {
    return res.status(400).json({ success: false, message: 'Name, Email, and Role are required.' });
  }

  const inquiries = getInquiries();
  const newCareerApp = {
    id: 'career-' + Date.now().toString(36),
    name: name.trim(),
    email: email.trim(),
    phone: phone || '',
    projectType: `Career Application: ${role}`,
    date: new Date().toISOString().split('T')[0],
    budget: experience ? `Exp: ${experience}` : 'N/A',
    message: `Portfolio: ${portfolioUrl || 'N/A'}\n\nCover Note: ${message || 'No additional note'}`,
    status: 'Career Review',
    createdAt: new Date().toISOString()
  };

  inquiries.unshift(newCareerApp);
  saveInquiries(inquiries);
  console.log(`[CAREER APP] ${newCareerApp.name} applied for ${role}`);

  res.status(201).json({
    success: true,
    message: 'Thank you for applying to Tech Shutter Hub! Our production lead will review your portfolio.',
    data: newCareerApp
  });
});

// 9. Get all inquiries (Admin protected - NO mock data)
app.get('/api/inquiries', authMiddleware, (req, res) => {
  const inquiries = getInquiries();
  res.json({ success: true, count: inquiries.length, data: inquiries });
});

// 10. Stats endpoint
app.get('/api/stats', (req, res) => {
  const projects = getProjects();
  const inquiries = getInquiries();
  const categories = [...new Set(projects.map(p => p.category))];
  const rituals = [...new Set(projects.filter(p => p.weddingRitual).map(p => p.weddingRitual))];
  res.json({
    success: true,
    totalProjects: projects.length,
    totalCategories: categories.length,
    totalInquiries: inquiries.length,
    categories,
    weddingRituals: rituals
  });
});

// Fallback routing to index.php for SPA feel
app.use((req, res, next) => {
  if (req.path.startsWith('/api/')) return next();
  sendPage(res, 'index.php');
});

app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🚀 TECH SHUTTER HUB Immersive Platform Live!`);
  console.log(`🌐 Server running at: http://localhost:${PORT}`);
  console.log(`🔑 Admin credentials configured (login via /admin.html)`);
  console.log(`=======================================================`);
});

module.exports = app;
