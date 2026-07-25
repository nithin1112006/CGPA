const mongoose = require('mongoose');
const Subject = require('../models/Subject');
require('dotenv').config();

/**
 * Migration script to add regulation field to existing subjects
 * Run with: node scripts/migrateSubjects.js
 * 
 * This will set regulation=21 for all existing subjects without a regulation field
 */

async function migrateSubjects() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // Find all subjects without regulation field
        const result = await Subject.updateMany(
            { regulation: { $exists: false } },
            { $set: { regulation: 21 } }
        );

        console.log(`✅ Updated ${result.modifiedCount} subjects with regulation=21`);
        console.log(`   (${result.matchedCount} subjects matched the criteria)`);

        // Show sample of updated subjects
        const sampleSubjects = await Subject.find({ regulation: 21 }).limit(5);
        console.log('\n📋 Sample migrated subjects:');
        sampleSubjects.forEach(sub => {
            console.log(`   - ${sub.label} (${sub.department}, ${sub.semester}) - Regulation: ${sub.regulation}`);
        });

        console.log('\n✨ Migration complete!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error migrating subjects:', error);
        process.exit(1);
    }
}

migrateSubjects();
