import React from 'react';
import { Link, useParams } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './SemesterSelect.css';

// Department configurations with max semesters and full names
const departmentConfig = {
    cse: { name: 'CSE', fullName: 'Computer Science and Engineering', maxSemesters: 8 },
    aids: { name: 'AIDS', fullName: 'AI and Data Science', maxSemesters: 8 },
    aiml: { name: 'AIML', fullName: 'AI and Machine Learning', maxSemesters: 8 },
    ece: { name: 'ECE', fullName: 'Electronics and Communication', maxSemesters: 8 },
    eee: { name: 'EEE', fullName: 'Electrical and Electronics', maxSemesters: 8 },
    it: { name: 'IT', fullName: 'Information Technology', maxSemesters: 8 },
    cyber: { name: 'Cyber', fullName: 'Cyber Security', maxSemesters: 8 },
    vlsi: { name: 'VLSI', fullName: 'VLSI Design', maxSemesters: 8 },
    ft: { name: 'FT', fullName: 'Food Technology', maxSemesters: 8 },
    bt: { name: 'BT', fullName: 'Bio Technology', maxSemesters: 5 },
    mech: { name: 'ME', fullName: 'Mechanical Engineering', maxSemesters: 8 },
    agri: { name: 'AG', fullName: 'Agricultural Engineering', maxSemesters: 5 },
    civil: { name: 'Civil', fullName: 'Civil Engineering', maxSemesters: 5 },
    bme: { name: 'BME', fullName: 'Bio Medical Engineering', maxSemesters: 5 },
};

const SemesterSelect = () => {
    const { department } = useParams();
    const config = departmentConfig[department] || {
        name: department.toUpperCase(),
        fullName: department.toUpperCase(),
        maxSemesters: 8
    };

    const semesters = Array.from({ length: config.maxSemesters }, (_, i) => i + 1);

    return (
        <div className="semester-select-page">
            <Header />

            {/* Page Hero */}
            <div className="page-hero">
                <div className="breadcrumb">
                    <Link to="/">Home</Link>
                    <span className="separator">›</span>
                    <Link to="/calculate">Departments</Link>
                    <span className="separator">›</span>
                    <span>{config.name}</span>
                </div>
                <h1 className="page-title">Select Your Semester</h1>
                <p className="page-subtitle">{config.fullName} ({config.name})</p>
            </div>

            {/* Semesters Grid */}
            <div className="semesters-grid">
                {semesters.map((sem) => (
                    <Link
                        key={sem}
                        className="semester-card"
                        to={`/calculate/${department}/semester-${sem}`}
                    >
                        <div className="dept-icon-wrapper">
                            <span className="semester-number" style={{ fontSize: '18px', fontWeight: '800', color: '#fff' }}>{sem}</span>
                        </div>
                        <div className="dept-content">
                            <h3 className="dept-short-name">Semester {sem}</h3>
                            <p className="dept-full-name">
                                Calculate SGPA for {getOrdinal(sem)} semester
                            </p>
                        </div>
                        <div className="dept-arrow">
                            <svg viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </div>
                    </Link>
                ))}
            </div>

            <Footer />
        </div>
    );
};

// Helper function to get ordinal suffix
const getOrdinal = (n) => {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
};

export default SemesterSelect;
