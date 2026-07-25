const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const Subject = require('../models/Subject');

async function checkAvailableData() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB\n');

        const batches = ['2023-2027', '2024-2028'];
        const semesters = ['Sem-3', 'Sem-5'];

        for (const batch of batches) {
            console.log(`\n========== BATCH: ${batch} ==========`);

            for (const semester of semesters) {
                console.log(`\n--- Semester: ${semester} ---`);

                // Get all departments that have data for this batch/semester
                const departments = await Subject.distinct('department', {
                    batch,
                    semester: { $regex: new RegExp(`^${semester}$`, 'i') }
                });

                console.log(`Departments with data: ${departments.join(', ')}`);

                // Count subjects for each department
                for (const dept of departments) {
                    const count = await Subject.countDocuments({
                        batch,
                        semester: { $regex: new RegExp(`^${semester}$`, 'i') },
                        department: { $regex: new RegExp(`^${dept}$`, 'i') }
                    });
                    console.log(`  ${dept}: ${count} subjects`);
                }
            }
        }

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await mongoose.disconnect();
    }
}

checkAvailableData();
