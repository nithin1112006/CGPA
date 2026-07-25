const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const Subject = require('../models/Subject');
const { getRegulationForBatch } = require('../utils/regulationMapper');

async function fixMissingRegulations() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB\n');

        // Find all subjects without regulation field
        const subjectsWithoutReg = await Subject.find({
            regulation: { $exists: false }
        });

        console.log(`Found ${subjectsWithoutReg.length} subjects without regulation field\n`);

        if (subjectsWithoutReg.length === 0) {
            console.log('✅ All subjects already have regulation field. Nothing to update.');
            return;
        }

        // Group by batch to show what will be updated
        const batchGroups = {};
        subjectsWithoutReg.forEach(subject => {
            if (!batchGroups[subject.batch]) {
                batchGroups[subject.batch] = 0;
            }
            batchGroups[subject.batch]++;
        });

        console.log('Subjects by batch:');
        Object.entries(batchGroups).forEach(([batch, count]) => {
            const regulation = getRegulationForBatch(batch);
            console.log(`  ${batch}: ${count} subjects → will set regulation=${regulation}`);
        });

        console.log('\n⚠️  This will UPDATE all subjects missing regulation field.');
        console.log('Starting update in 2 seconds...\n');

        await new Promise(resolve => setTimeout(resolve, 2000));

        // Update each subject
        let updated = 0;
        for (const subject of subjectsWithoutReg) {
            const regulation = getRegulationForBatch(subject.batch);
            if (regulation) {
                await Subject.findByIdAndUpdate(subject._id, { regulation });
                updated++;
                if (updated % 50 === 0) {
                    console.log(`Updated ${updated}/${subjectsWithoutReg.length}...`);
                }
            }
        }

        console.log(`\n✅ Successfully updated ${updated} subjects with regulation field!`);

        // Verify the fix
        console.log('\n--- Verification ---');
        const testCases = [
            { semester: 'Sem-5', department: 'AGRI', batch: '2023-2027', regulation: 21 },
            { semester: 'Sem-5', department: 'AIML', batch: '2023-2027', regulation: 21 },
            { semester: 'Sem-3', department: 'CSE', batch: '2024-2028', regulation: 21 },
        ];

        for (const filter of testCases) {
            const count = await Subject.countDocuments({
                semester: { $regex: new RegExp(`^${filter.semester}$`, 'i') },
                department: { $regex: new RegExp(`^${filter.department}$`, 'i') },
                batch: filter.batch,
                regulation: filter.regulation
            });
            console.log(`${filter.semester} ${filter.department} ${filter.batch}: ${count} subjects`);
        }

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await mongoose.disconnect();
    }
}

fixMissingRegulations();
