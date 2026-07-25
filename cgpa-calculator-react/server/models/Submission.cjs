const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
    username: String,
    semester: String,
    department: String,
    grades: Object,
    cgpa: String,
    batch: String,        // e.g., "2024-2028"
    regulation: Number    // e.g., 21, 25, 29
});

module.exports = mongoose.model('Submission', submissionSchema);
