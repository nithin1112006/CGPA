const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const Subject = require('../models/Subject');

async function debugSubjects() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const batchesToCheck = ['2023-2027', '2024-2028'];
        for (const batch of batchesToCheck) {
            console.log(`\n--- Batch: ${batch} ---`);

            const distinctDepts = await Subject.find({ batch }).distinct('department');
            console.log('Departments in DB:', distinctDepts);

            // Check counts for Sem-3 and Sem-5 for each dept
            for (const dept of distinctDepts) {
                const count3 = await Subject.countDocuments({ batch, department: dept, semester: 'Sem-3' });
                const count5 = await Subject.countDocuments({ batch, department: dept, semester: 'Sem-5' });
                console.log(`  Dept "${dept}": Sem-3=${count3}, Sem-5=${count5}`);
            }
        }

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await mongoose.disconnect();
    }
}

debugSubjects();
