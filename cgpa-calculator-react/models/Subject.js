import mongoose from 'mongoose';

const subjectSchema = new mongoose.Schema({
    label: String,
    credit: Number,
    semester: String,
    department: String,
    batch: String,
    regulation: { type: Number, required: true }
});

export default mongoose.model('Subject', subjectSchema);
