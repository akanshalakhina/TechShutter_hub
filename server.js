const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve static frontend files
app.use(express.static(path.join(__dirname, 'public')));

const DATA_FILE = path.join(__dirname, 'data', 'projects.json');
const PUBLIC_DATA_FILE = path.join(__dirname, 'public', 'projects.json');
const INQUIRIES_FILE = path.join(__dirname, 'data', 'inquiries.json');

// Ensure inquiries file exists
if (!fs.existsSync(INQUIRIES_FILE)) {
  fs.writeFileSync(INQUIRIES_FILE, JSON.stringify([], null, 2));
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

// REST API Endpoints

// 1. Get projects (filterable by category, weddingRitual, and search)
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

// 2. Get single project
app.get('/api/projects/:id', (req, res) => {
  const list = getProjects();
  const project = list.find(p => p.id === req.params.id);
  if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
  res.json({ success: true, data: project });
});

// 3. Create project (Admin capability)
app.post('/api/projects', (req, res) => {
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

// 4. Update project
app.put('/api/projects/:id', (req, res) => {
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

// 5. Delete project
app.delete('/api/projects/:id', (req, res) => {
  let list = getProjects();
  const initialLength = list.length;
  list = list.filter(p => p.id !== req.params.id);
  if (list.length === initialLength) {
    return res.status(404).json({ success: false, message: 'Project not found' });
  }
  saveProjects(list);
  res.json({ success: true, message: 'Project removed successfully' });
});

// 6. Direct Photo Upload API for Admin (supports base64 image data from file picker)
app.post('/api/upload', async (req, res) => {
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

// 7. Submit Client Inquiry / Project Booking
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

// 8. Career application submission
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

// 9. Get all inquiries (for admin review)
app.get('/api/inquiries', (req, res) => {
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

// Fallback routing to index.html for SPA feel
app.use((req, res, next) => {
  if (req.path.startsWith('/api/')) return next();
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🚀 TECH SHUTTER HUB Immersive Platform Live!`);
  console.log(`🌐 Server running at: http://localhost:${PORT}`);
  console.log(`=======================================================`);
});
