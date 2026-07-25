const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const Subject = require('./models/Subject.cjs');
const Submission = require('./models/Submission.cjs');
const Regulation = require('./models/Regulation.cjs');
const { getRegulationForBatch, getRegulationDisplayName, getRegulationFullName } = require('./utils/regulationMapper.cjs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// GET: Fetch subjects
app.get('/api/subjects', async (req, res) => {
  const { semester, department, batch, regulation } = req.query;

  const filter = {};

  if (semester) {
    // Case-insensitive match, trimming whitespace
    filter.semester = { $regex: new RegExp(`^${semester.trim()}$`, 'i') };
  }
  if (department) {
    // Case-insensitive match, trimming whitespace
    filter.department = { $regex: new RegExp(`^${department.trim()}$`, 'i') };
  }
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
    console.error('[GET /api/subjects] Error:', err);
    res.status(500).json({ message: 'Error fetching subjects' });
  }
});

// GET: Fetch distinct batches
app.get('/api/batches', async (req, res) => {
  const { department, semester } = req.query;
  const filter = {};

  if (department) {
    filter.department = { $regex: new RegExp(`^${department.trim()}$`, 'i') };
  }
  if (semester) {
    filter.semester = { $regex: new RegExp(`^${semester.trim()}$`, 'i') };
  }

  try {
    const batches = await Subject.distinct('batch', filter);
    // Sort batches (assuming they are years like "2024-2028")
    batches.sort((a, b) => b.localeCompare(a));
    res.json(batches);
  } catch (err) {
    console.error('[GET /api/batches] Error:', err);
    res.status(500).json({ message: 'Error fetching batches' });
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



// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
