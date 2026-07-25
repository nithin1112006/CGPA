const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const Subject = require('../models/Subject');

async function simulateQuery() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const testCases = [
            { semester: 'Sem-5', department: 'CSE', batch: '2023-2027', regulation: 21 },
            { semester: 'Sem-3', department: 'CSE', batch: '2024-2028', regulation: 21 },
            { semester: 'Sem-3', department: 'AIDS', batch: '2024-2028', regulation: 21 },
        ];

        for (const filter of testCases) {
            console.log(`\nTesting Filter: ${JSON.stringify(filter)}`);

            const count = await Subject.countDocuments(filter);
            console.log(`Exact Match Count: ${count}`);

            if (count === 0) {
                console.log('  -> No exact matches. Checking for potential mismatches...');
                // Check without regulation
                const noRegCount = await Subject.countDocuments({
                    semester: filter.semester,
                    department: filter.department,
                    batch: filter.batch
                });
                console.log(`  -> Count without regulation: ${noRegCount}`);

                // Check for whitespace in department
                const regexDept = new RegExp(`^${filter.department}\\s*$`, 'i');
                const fuzzyDeptCount = await Subject.countDocuments({
                    semester: filter.semester,
                    department: regexDept,
                    batch: filter.batch
                });
                console.log(`  -> Count with fuzzy department (case/trim): ${fuzzyDeptCount}`);

                if (fuzzyDeptCount > 0) {
                    const sample = await Subject.findOne({ semester: filter.semester, department: regexDept, batch: filter.batch });
                    console.log(`  -> Sample found with fuzzy search: Dept="${sample.department}"`);
                }
            }
        }

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await mongoose.disconnect();
    }
}

simulateQuery();
