const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const Subject = require('../models/Subject');

// Frontend department mapping (from SGPACalculator.jsx)
const frontendMapping = {
    'cse': 'CSE',
    'aids': 'AIDS',
    'aiml': 'AIML',
    'ece': 'ECE',
    'eee': 'EEE',
    'it': 'IT',
    'cyber': 'Cyber',
    'vlsi': 'VLSI',
    'ft': 'FT',
    'bt': 'BT',
    'mech': 'ME',      // Frontend sends "ME"
    'agri': 'AG',      // Frontend sends "AG"
    'civil': 'Civil',  // Frontend sends "Civil"
    'bme': 'BME',
};

async function checkDeptMismatches() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB\n');

        // Get all unique departments in DB
        const dbDepartments = await Subject.distinct('department');
        console.log('Departments in DATABASE:', dbDepartments.sort());
        console.log('\nDepartments that FRONTEND sends:', Object.values(frontendMapping).sort());

        console.log('\n========== MISMATCH ANALYSIS ==========\n');

        // Check which DB departments don't match frontend
        const frontendDepts = new Set(Object.values(frontendMapping));
        const mismatches = [];

        for (const dbDept of dbDepartments) {
            // Case-insensitive check
            const hasMatch = Array.from(frontendDepts).some(
                fDept => fDept.toLowerCase() === dbDept.toLowerCase()
            );

            if (!hasMatch) {
                console.log(`⚠️  "${dbDept}" in DB has NO matching frontend mapping`);
                mismatches.push(dbDept);
            }
        }

        if (mismatches.length === 0) {
            console.log('✅ All database departments have frontend mappings (case-insensitive)');
        }

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await mongoose.disconnect();
    }
}

checkDeptMismatches();
