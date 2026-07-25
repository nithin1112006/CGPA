const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const Subject = require('../models/Subject');

async function verifyFixLogic() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Mocks of what we expect the frontend to send
        const testCases = [
            { semester: 'Sem-5', department: 'CSE', batch: '2023-2027' },
            // Intentionally using case mismatch or whitespace if that was the issue, 
            // but here we just test that the regex finds the standard data.
            { semester: 'sem-5', department: 'cse', batch: '2023-2027' }, // Lowercase test
            { semester: 'Sem-3', department: 'AIDS', batch: '2024-2028' },
        ];

        for (const { semester, department, batch } of testCases) {
            console.log(`\nTesting Logic for: Semester="${semester}", Dept="${department}", Batch="${batch}"`);

            const filter = {};
            if (semester) filter.semester = { $regex: new RegExp(`^${semester.trim()}$`, 'i') };
            if (department) filter.department = { $regex: new RegExp(`^${department.trim()}$`, 'i') };
            if (batch) filter.batch = batch;

            // We know regulation 21 is valid for these based on mapper, so let's include it or let it find any
            // In server.js logic:
            // if (batch) { const autoRegulation = ...; if (autoRegulation) filter.regulation = autoRegulation; }
            // For these batches, it maps to 21.
            filter.regulation = 21;

            const count = await Subject.countDocuments(filter);
            console.log(`Matched Documents: ${count}`);

            if (count > 0) {
                console.log('✅ Fix verification PASSED for this case.');
            } else {
                console.log('❌ Fix verification FAILED for this case.');
            }
        }

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await mongoose.disconnect();
    }
}

verifyFixLogic();
