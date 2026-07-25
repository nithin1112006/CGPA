import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './DepartmentSelect.css';

const departments = [
    { code: 'cse', name: 'Computer Science And Engineering', shortName: 'CSE', icon: 'computer' },
    { code: 'aids', name: 'Artificial Intelligence and Data Science', shortName: 'AIDS', icon: 'ai' },
    { code: 'aiml', name: 'Artificial Intelligence and Machine Learning', shortName: 'AIML', icon: 'brain' },
    { code: 'ece', name: 'Electronics and Communication Engineering', shortName: 'ECE', icon: 'circuit' },
    { code: 'eee', name: 'Electrical and Electronics Engineering', shortName: 'EEE', icon: 'bolt' },
    { code: 'it', name: 'Information Technology', shortName: 'IT', icon: 'network' },
    { code: 'cyber', name: 'Cyber Security', shortName: 'CS', icon: 'shield' },
    { code: 'vlsi', name: 'Very Large Scale Integration', shortName: 'VLSI', icon: 'chip' },
    { code: 'ft', name: 'Food Technology', shortName: 'FT', icon: 'food' },
    { code: 'bt', name: 'Bio Technology', shortName: 'BT', icon: 'bio' },
    { code: 'mech', name: 'Mechanical Engineering', shortName: 'ME', icon: 'gear' },
    { code: 'agri', name: 'Agricultural Engineering', shortName: 'AG', icon: 'plant' },
    { code: 'civil', name: 'Civil Engineering', shortName: 'Civil', icon: 'building' },
    { code: 'bme', name: 'Bio Medical Engineering', shortName: 'BME', icon: 'medical' },
];

// Icon components for each department
const DepartmentIcon = ({ type }) => {
    const icons = {
        computer: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                <line x1="8" y1="21" x2="16" y2="21"></line>
                <line x1="12" y1="17" x2="12" y2="21"></line>
            </svg>
        ),
        ai: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
                <polyline points="2 17 12 22 22 17"></polyline>
                <polyline points="2 12 12 17 22 12"></polyline>
            </svg>
        ),
        brain: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
            </svg>
        ),
        circuit: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect>
                <rect x="9" y="9" width="6" height="6"></rect>
                <line x1="9" y1="1" x2="9" y2="4"></line>
                <line x1="15" y1="1" x2="15" y2="4"></line>
                <line x1="9" y1="20" x2="9" y2="23"></line>
                <line x1="15" y1="20" x2="15" y2="23"></line>
                <line x1="20" y1="9" x2="23" y2="9"></line>
                <line x1="20" y1="14" x2="23" y2="14"></line>
                <line x1="1" y1="9" x2="4" y2="9"></line>
                <line x1="1" y1="14" x2="4" y2="14"></line>
            </svg>
        ),
        bolt: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
            </svg>
        ),
        network: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="2" y1="12" x2="22" y2="12"></line>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
            </svg>
        ),
        shield: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
            </svg>
        ),
        chip: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect>
                <rect x="9" y="9" width="6" height="6"></rect>
                <line x1="9" y1="1" x2="9" y2="4"></line>
                <line x1="15" y1="1" x2="15" y2="4"></line>
                <line x1="9" y1="20" x2="9" y2="23"></line>
                <line x1="15" y1="20" x2="15" y2="23"></line>
                <line x1="20" y1="9" x2="23" y2="9"></line>
                <line x1="20" y1="14" x2="23" y2="14"></line>
                <line x1="1" y1="9" x2="4" y2="9"></line>
                <line x1="1" y1="14" x2="4" y2="14"></line>
            </svg>
        ),
        food: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 8h1a4 4 0 0 1 0 8h-1"></path>
                <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path>
                <line x1="6" y1="1" x2="6" y2="4"></line>
                <line x1="10" y1="1" x2="10" y2="4"></line>
                <line x1="14" y1="1" x2="14" y2="4"></line>
            </svg>
        ),
        bio: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"></path>
            </svg>
        ),
        gear: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M12 1v6m0 6v6m5.5-11.5l-4.2 4.2m-2.6 2.6L6.5 18.5m12-12l-4.2 4.2m-2.6 2.6l-4.2 4.2m12 0l-4.2-4.2m-2.6-2.6L5.5 5.5"></path>
            </svg>
        ),
        plant: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M7 20h10"></path>
                <path d="M10 20c5.5-2.5.8-6.4 3-10"></path>
                <path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8z"></path>
                <path d="M14.1 6a7 7 0 0 0-1.1 4c1.9-.1 3.3-.6 4.3-1.4 1-1 1.6-2.3 1.7-4.6-2.7.1-4 1-4.9 2z"></path>
            </svg>
        ),
        building: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
        ),
        medical: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
            </svg>
        ),
    };

    return icons[type] || icons.computer;
};

const DepartmentSelect = () => {
    return (
        <div className="department-select-page">
            <Header />

            {/* Page Hero */}
            <div className="page-hero">
                <div className="breadcrumb">
                    <Link to="/">Home</Link>
                    <span className="separator">›</span>
                    <span>Select Department</span>
                </div>
                <h1 className="page-title">Choose Your Department</h1>
                <p className="page-subtitle">Select your department to calculate SGPA</p>
            </div>

            {/* Department Grid */}
            <div className="departments-grid">
                {departments.map((dept) => (
                    <Link
                        key={dept.code}
                        className="department-card"
                        to={`/calculate/${dept.code}`}
                    >
                        <div className="dept-icon-wrapper">
                            <DepartmentIcon type={dept.icon} />
                        </div>
                        <div className="dept-content">
                            <h3 className="dept-short-name">{dept.shortName}</h3>
                            <p className="dept-full-name">{dept.name}</p>
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

export default DepartmentSelect;
