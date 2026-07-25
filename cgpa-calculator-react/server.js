import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import bodyParser from 'body-parser';
import Subject from './models/Subject.js';
import Submission from './models/Submission.js';
import Regulation from './models/Regulation.js';
import { getRegulationForBatch, getRegulationDisplayName, getRegulationFullName } from './src/utils/batchMapper.js';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Serve React build in production
app.use(express.static(path.join(__dirname, 'dist')));
app.use('/images', express.static(path.join(__dirname, 'public/images')));

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// GET: Fetch subjects
app.get('/api/subjects', async (req, res) => {
  const { semester, department, batch, regulation } = req.query;
  const filter = {};

  if (semester) filter.semester = semester;
  if (department) filter.department = department;
  if (batch) filter.batch = batch;

  // Auto-determine regulation from batch if not provided
  if (regulation) {
    filter.regulation = parseInt(regulation);
  } else if (batch) {
    const autoRegulation = getRegulationForBatch(batch);
    if (autoRegulation) filter.regulation = autoRegulation;
  }

  try {
    const subjects = await Subject.find(filter);
    res.json(subjects);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching subjects' });
  }
});

// POST: Add a new subject
app.post('/api/subjects', async (req, res) => {
  const { label, credit, semester, department, batch, regulation } = req.body;

  if (!label || credit === undefined || credit === null || credit === '' || !semester || !department || !batch || !regulation) {
    return res.status(400).json({ message: 'All fields are required including regulation' });
  }

  try {
    const newSubject = new Subject({ label, credit, semester, department, batch, regulation });
    await newSubject.save();
    res.json({ message: 'Subject added successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error adding subject' });
  }
});

// DELETE: Remove subject by ID
app.delete('/api/subjects/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await Subject.findByIdAndDelete(id);
    res.json({ message: 'Subject deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error deleting subject' });
  }
});

// ====== REGULATION API ENDPOINTS ======

// GET: Fetch all regulations
app.get('/api/regulations', async (req, res) => {
  try {
    const regulations = await Regulation.find().sort({ year: 1 });
    res.json(regulations);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching regulations' });
  }
});

// GET: Fetch active regulations
app.get('/api/regulations/active', async (req, res) => {
  try {
    const regulations = await Regulation.find({ isActive: true }).sort({ year: 1 });
    res.json(regulations);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching active regulations' });
  }
});

// GET: Get regulation for specific batch
app.get('/api/regulations/for-batch/:batch', async (req, res) => {
  const { batch } = req.params;

  try {
    const regulationYear = getRegulationForBatch(batch);
    if (!regulationYear) {
      return res.status(404).json({ message: 'Could not determine regulation for batch' });
    }

    const regulation = await Regulation.findOne({ year: regulationYear });
    if (!regulation) {
      return res.status(404).json({ message: 'Regulation not found' });
    }

    res.json(regulation);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching regulation for batch' });
  }
});

// POST: Create new regulation (admin)
app.post('/api/regulations', async (req, res) => {
  const { year, name, displayName, startBatchYear, endBatchYear, isActive } = req.body;

  if (!year || !name || !displayName || !startBatchYear) {
    return res.status(400).json({ message: 'Required fields: year, name, displayName, startBatchYear' });
  }

  try {
    const newRegulation = new Regulation({
      year,
      name,
      displayName,
      startBatchYear,
      endBatchYear: endBatchYear || null,
      isActive: isActive !== undefined ? isActive : true
    });

    await newRegulation.save();
    res.json({ message: 'Regulation created successfully', regulation: newRegulation });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error creating regulation' });
  }
});

// PUT: Update regulation (admin)
app.put('/api/regulations/:id', async (req, res) => {
  const { id } = req.params;
  const { year, name, displayName, startBatchYear, endBatchYear, isActive } = req.body;

  try {
    const updateData = { updatedAt: Date.now() };
    if (year !== undefined) updateData.year = year;
    if (name !== undefined) updateData.name = name;
    if (displayName !== undefined) updateData.displayName = displayName;
    if (startBatchYear !== undefined) updateData.startBatchYear = startBatchYear;
    if (endBatchYear !== undefined) updateData.endBatchYear = endBatchYear;
    if (isActive !== undefined) updateData.isActive = isActive;

    const updated = await Regulation.findByIdAndUpdate(id, updateData, { new: true });
    res.json({ message: 'Regulation updated successfully', regulation: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error updating regulation' });
  }
});

// DELETE: Remove regulation (admin)
app.delete('/api/regulations/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await Regulation.findByIdAndDelete(id);
    res.json({ message: 'Regulation deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error deleting regulation' });
  }
});


// PUT: Update subject by ID
app.put('/api/subjects/:id', async (req, res) => {
  const { id } = req.params;
  const { label, credit, semester, department, batch, regulation } = req.body;

  if (!label || credit === undefined || credit === null || credit === '' || !semester || !department || !batch || !regulation) {
    return res.status(400).json({ message: 'All fields are required including regulation' });
  }

  try {
    await Subject.findByIdAndUpdate(id, {
      label,
      credit,
      semester,
      department,
      batch,
      regulation
    });

    res.json({ message: 'Subject updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error updating subject' });
  }
});

// POST: Save student CGPA submission
app.post('/submit-cgpa', async (req, res) => {
  const { username, title, grades, cgpa, batch } = req.body;

  if (!username || !title || !grades || !cgpa) {
    return res.status(400).json({ message: 'Incomplete data' });
  }

  const [semester, ...deptParts] = title.split(" ");
  const department = deptParts.join(" ");

  // Auto-determine regulation from batch
  const regulation = batch ? getRegulationForBatch(batch) : null;

  try {
    const newSubmission = new Submission({
      username,
      semester,
      department,
      grades,
      cgpa,
      batch: batch || 'Unknown',
      regulation: regulation || 21  // Default to 21 if can't determine
    });

    await newSubmission.save();
    res.json({ message: "SGPA calculated successfully!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error submitting SGPA' });
  }
});

// ====== ADMIN LOGIN ENDPOINT ======
app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;
  const adminUsername = process.env.VITE_ADMIN_USERNAME;
  const adminPassword = process.env.VITE_ADMIN_PASSWORD;

  if (!adminUsername || !adminPassword) {
    return res.status(500).json({ success: false, message: 'Admin credentials not configured on server' });
  }

  if (username === adminUsername && password === adminPassword) {
    res.json({ success: true, message: 'Login successful' });
  } else {
    res.status(401).json({ success: false, message: 'Invalid username or password' });
  }
});

// Serve React app for all other routes (SPA)
app.use((req, res, next) => {
  // If no API route matched, serve React app
  if (!req.path.startsWith('/api') && !req.path.startsWith('/submit-cgpa') && !req.path.startsWith('/images')) {
    const indexPath = path.join(__dirname, 'dist', 'index.html');
    console.log(`Serving SPA index from: ${indexPath}`);

    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    res.sendFile(indexPath, (err) => {
      if (err) {
        console.error('Error sending index.html:', err);
        res.status(404).send("Frontend build not found. Make sure 'npm run build' was executed.");
      }
    });
  } else {
    next();
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
