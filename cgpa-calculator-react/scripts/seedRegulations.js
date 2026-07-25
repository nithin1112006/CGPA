const mongoose = require('mongoose');
const Regulation = require('../models/Regulation');
const { getRegulationFullName } = require('../utils/regulationMapper');
require('dotenv').config();

/**
 * Seed script to populate initial regulation data
 * Run with: node scripts/seedRegulations.js
 */

const regulations = [
    {
        year: 21,
        name: getRegulationFullName(21),
        displayName: '21regulation',
        startBatchYear: 2021,
        endBatchYear: 2024,
        isActive: true
    },
    {
        year: 25,
        name: getRegulationFullName(25),
        displayName: '25regulation',
        startBatchYear: 2025,
        endBatchYear: 2028,
        isActive: true
    },
    {
        year: 29,
        name: getRegulationFullName(29),
        displayName: '29regulation',
        startBatchYear: 2029,
        endBatchYear: 2032,
        isActive: false  // Will be activated in 2029
    },
    {
        year: 33,
        name: getRegulationFullName(33),
        displayName: '33regulation',
        startBatchYear: 2033,
        endBatchYear: 2036,
        isActive: false  // Will be activated in 2033
    }
];

async function seedRegulations() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // Clear existing regulations
        await Regulation.deleteMany({});
        console.log('🗑️  Cleared existing regulations');

        // Insert new regulations
        const inserted = await Regulation.insertMany(regulations);
        console.log(`✅ Inserted ${inserted.length} regulations:`);
        inserted.forEach(reg => {
            console.log(`   - ${reg.name} (${reg.displayName}) - Batches ${reg.startBatchYear}-${reg.endBatchYear || 'ongoing'}`);
        });

        console.log('\n✨ Regulation seeding complete!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding regulations:', error);
        process.exit(1);
    }
}

seedRegulations();
