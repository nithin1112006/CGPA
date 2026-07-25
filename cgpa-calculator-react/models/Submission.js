import mongoose from 'mongoose';

const submissionSchema = new mongoose.Schema({
    username: { type: String, required: true },
    semester: { type: String, required: true },
    department: { type: String, required: true },
    grades: { type: Map, of: Number, required: true },
    cgpa: { type: String, required: true },
    batch: { type: String, required: true },
    regulation: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Submission', submissionSchema);
