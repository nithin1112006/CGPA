const mongoose = require('mongoose');

const regulationSchema = new mongoose.Schema({
  year: { 
    type: Number, 
    required: true, 
    unique: true 
  }, // 21, 25, 29
  name: { 
    type: String, 
    required: true 
  }, // "2021 Regulation", "2025 Regulation"
  displayName: {
    type: String,
    required: true
  }, // "21regulation", "25regulation"
  startBatchYear: { 
    type: Number, 
    required: true 
  }, // First batch start year (e.g., 2021, 2025)
  endBatchYear: { 
    type: Number, 
    default: null 
  }, // Last batch start year (null = ongoing)
  isActive: { 
    type: Boolean, 
    default: true 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Update timestamp on save
regulationSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Regulation', regulationSchema);
