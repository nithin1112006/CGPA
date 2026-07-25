import React, { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import CustomAlert from '../components/CustomAlert';
import { fireCelebration } from '../utils/celebration';
import './CGPACalculator.css';

const CGPACalculator = () => {
    const [semesters, setSemesters] = useState([{ sgpa: '', credits: '' }]);
    const [cgpa, setCgpa] = useState(null);
    const [alert, setAlert] = useState({ show: false, message: '' });
    const [greeting, setGreeting] = useState('');

    const showAlert = (message) => {
        setAlert({ show: true, message });
    };

    const hideAlert = () => {
        setAlert({ show: false, message: '' });
    };

    const addSemester = () => {
        if (semesters.length < 8) {
            setSemesters([...semesters, { sgpa: '', credits: '' }]);
        } else {
            showAlert('Maximum 8 semesters allowed');
        }
    };

    const removeSemester = (index) => {
        const newSemesters = semesters.filter((_, i) => i !== index);
        setSemesters(newSemesters);
    };

    const updateSemester = (index, field, value) => {
        const newSemesters = [...semesters];
        newSemesters[index][field] = value;
        setSemesters(newSemesters);
    };

    const calculateCGPA = () => {
        let totalCredits = 0;
        let weightedSGPA = 0;

        for (const sem of semesters) {
            const sgpa = parseFloat(sem.sgpa);
            const credits = parseFloat(sem.credits);

            if (isNaN(sgpa) || isNaN(credits) || sgpa <= 0 || credits <= 0) {
                showAlert('Please enter valid SGPA and credits for all semesters');
                return;
            }

            if (sgpa > 10) {
                showAlert('SGPA cannot be greater than 10');
                return;
            }

            weightedSGPA += sgpa * credits;
            totalCredits += credits;
        }

        if (totalCredits === 0) {
            showAlert('Total credits cannot be zero');
            return;
        }

        const calculatedCGPA = (weightedSGPA / totalCredits).toFixed(3);
        setCgpa(calculatedCGPA);
        const newGreeting = fireCelebration(calculatedCGPA);
        setGreeting(newGreeting);
    };

    return (
        <div className="cgpa-calculator-page">
            <Header />
            <CustomAlert message={alert.message} show={alert.show} onClose={hideAlert} />

            <div className="cgpa-calculator-container">
                {/* Header Section */}
                <div className="cgpa-header">
                    <div className="cgpa-header-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                        </svg>
                    </div>
                    <h1>CGPA Calculator</h1>
                    <p>Calculate your Cumulative Grade Point Average across all semesters</p>
                </div>

                {/* Info Card */}
                <div className="cgpa-info-card">
                    <h3>About CGPA</h3>
                    <ul className="cgpa-info-list">
                        <li>CGPA is the overall average of SGPAs over all completed semesters</li>
                        <li>It gives your academic performance across the entire course</li>
                        <li>Enter your SGPA and credits for each semester below</li>
                    </ul>
                </div>

                {/* Semesters Container */}
                <div className="cgpa-semesters-container">
                    <div className="semesters-header">
                        <h3>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '20px', height: '20px' }}>
                                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                            </svg>
                            Your Semesters
                        </h3>
                        <span className="semesters-count">{semesters.length} Semester{semesters.length !== 1 ? 's' : ''}</span>
                    </div>

                    {semesters.map((sem, index) => (
                        <div key={index} className="semester-card">
                            <div className="semester-card-header">
                                <div className="semester-label">
                                    Semester {index + 1}
                                </div>
                                {semesters.length > 1 && (
                                    <button
                                        onClick={() => removeSemester(index)}
                                        className="remove-semester-btn"
                                        aria-label="Remove semester"
                                        title="Remove this semester"
                                    >
                                        ✕
                                    </button>
                                )}
                            </div>

                            <div className="semester-inputs">
                                <div className="input-group">
                                    <label htmlFor={`sgpa-${index}`}>
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M12 20V10"></path>
                                            <path d="M18 20V4"></path>
                                            <path d="M6 20v-4"></path>
                                        </svg>
                                        SGPA
                                    </label>
                                    <input
                                        id={`sgpa-${index}`}
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        max="10"
                                        placeholder="e.g., 8.5"
                                        value={sem.sgpa}
                                        onChange={(e) => updateSemester(index, 'sgpa', e.target.value)}
                                    />
                                </div>

                                <div className="input-group">
                                    <label htmlFor={`credits-${index}`}>
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <circle cx="12" cy="12" r="10"></circle>
                                            <polyline points="12 6 12 12 16 14"></polyline>
                                        </svg>
                                        Credits
                                    </label>
                                    <input
                                        id={`credits-${index}`}
                                        type="number"
                                        step="0.5"
                                        min="0"
                                        placeholder="e.g., 20"
                                        value={sem.credits}
                                        onChange={(e) => updateSemester(index, 'credits', e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Action Buttons */}
                <div className="cgpa-actions">
                    <button className="add-semester-btn" onClick={addSemester}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                        Add Semester
                    </button>

                    <button className="calculate-btn" onClick={calculateCGPA}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="4" y="2" width="16" height="20" rx="2"></rect>
                            <line x1="8" y1="6" x2="16" y2="6"></line>
                            <line x1="16" y1="14" x2="16" y2="14"></line>
                            <line x1="8" y1="14" x2="8" y2="14"></line>
                            <line x1="12" y1="14" x2="12" y2="14"></line>
                            <line x1="16" y1="18" x2="16" y2="18"></line>
                            <line x1="8" y1="18" x2="8" y2="18"></line>
                            <line x1="12" y1="18" x2="12" y2="18"></line>
                        </svg>
                        Calculate CGPA
                    </button>
                </div>

                {/* Result Display */}
                {cgpa && (
                    <div className="cgpa-result">
                        <div className="cgpa-result-icon">🎓</div>
                        <h2>Your CGPA</h2>
                        <p className="cgpa-value">{cgpa}</p>
                        <p>
                            {greeting}
                        </p>
                    </div>
                )}
            </div>

            <Footer />
        </div>
    );
};

export default CGPACalculator;
