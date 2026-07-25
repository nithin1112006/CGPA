import mongoose from 'mongoose';

const regulationSchema = new mongoose.Schema({
    year: { type: Number, required: true, unique: true },
    name: { type: String, required: true },
    displayName: { type: String, required: true },
    startBatchYear: { type: Number, required: true },
    endBatchYear: { type: Number, default: null },
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model('Regulation', regulationSchema);
