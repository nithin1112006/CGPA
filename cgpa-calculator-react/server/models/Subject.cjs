const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema({
  label: String,
  credit: Number,
  semester: String,
  department: String,
  batch: String,  // ✅ must include batch
  regulation: { type: Number, required: true }  // 21, 25, 29, etc.
});

module.exports = mongoose.model('Subject', subjectSchema);
