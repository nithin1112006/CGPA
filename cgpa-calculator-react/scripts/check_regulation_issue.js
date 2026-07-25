const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const Subject = require('../models/Subject');

async function checkRegulationIssue() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB\n');

        // Test the exact query that's failing
        const failingCase = {
            semester: 'Sem-5',
            department: 'AGRI',
            batch: '2023-2027'
        };

        console.log('Testing failing case: Sem-5 AGRI 2023-2027\n');

        // 1. Check without regulation filter
        const withoutReg = await Subject.countDocuments({
            semester: { $regex: new RegExp(`^${failingCase.semester}$`, 'i') },
            department: { $regex: new RegExp(`^${failingCase.department}$`, 'i') },
            batch: failingCase.batch
        });
        console.log(`Without regulation filter: ${withoutReg} subjects`);

        // 2. Check with regulation = 21
        const withReg21 = await Subject.countDocuments({
            semester: { $regex: new RegExp(`^${failingCase.semester}$`, 'i') },
            department: { $regex: new RegExp(`^${failingCase.department}$`, 'i') },
            batch: failingCase.batch,
            regulation: 21
        });
        console.log(`With regulation=21: ${withReg21} subjects`);

        // 3. Check with regulation field missing
        const noRegField = await Subject.countDocuments({
            semester: { $regex: new RegExp(`^${failingCase.semester}$`, 'i') },
            department: { $regex: new RegExp(`^${failingCase.department}$`, 'i') },
            batch: failingCase.batch,
            regulation: { $exists: false }
        });
        console.log(`With regulation field MISSING: ${noRegField} subjects`);

        // 4. Get a sample to see what regulation values exist
        const sample = await Subject.findOne({
            semester: { $regex: new RegExp(`^${failingCase.semester}$`, 'i') },
            department: { $regex: new RegExp(`^${failingCase.department}$`, 'i') },
            batch: failingCase.batch
        });

        if (sample) {
            console.log('\nSample subject:');
            console.log(JSON.stringify(sample, null, 2));
        }

        // 5. Check all regulation values for Sem-5 data
        console.log('\n--- Checking all Sem-5 subjects for regulation values ---');
        const sem5Subjects = await Subject.find({
            semester: { $regex: /^Sem-5$/i },
            batch: { $in: ['2023-2027', '2024-2028'] }
        }).limit(5);

        console.log(`\nFirst 5 Sem-5 subjects and their regulation values:`);
        sem5Subjects.forEach(s => {
            console.log(`  ${s.department} - ${s.label} - regulation: ${s.regulation}`);
        });

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await mongoose.disconnect();
    }
}

checkRegulationIssue();
