import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import SkeletonLoader from '../components/SkeletonLoader';
import CustomAlert from '../components/CustomAlert';
import { getSubjects, submitCGPA, getAvailableBatches } from '../services/api';
import { gradeOptions } from '../utils/gradeOptions';
import { getRegulationForBatch, DEFAULT_BATCHES, getRegulationFullName } from '../utils/batchMapper';
import { isBlendedSubject } from '../utils/subjectUtils';
import { generatePDF } from '../utils/pdfGenerator';
import { fireCelebration } from '../utils/celebration';
import { departments, DepartmentIcon } from '../utils/departmentData';
import './SGPACalculator.css';

const SGPACalculator = () => {
    const { department: paramDept, semester: paramSem } = useParams();

    // Steps: 1: Batch, 2: Department, 3: Semester, 4: Calculator
    const [currentStep, setCurrentStep] = useState(1);

    // Selection State
    const [selectedBatch, setSelectedBatch] = useState('');
    const [selectedDepartment, setSelectedDepartment] = useState('');
    const [selectedSemester, setSelectedSemester] = useState('');

    const [username, setUsername] = useState('');
    const [availableBatches, setAvailableBatches] = useState(DEFAULT_BATCHES);
    const [subjects, setSubjects] = useState([]);
    const [grades, setGrades] = useState({});
    const [sgpa, setSgpa] = useState(null);
    const [loading, setLoading] = useState(false);
    const [alert, setAlert] = useState({ show: false, message: '' });
    const [greeting, setGreeting] = useState('');

    // Load available batches on mount
    useEffect(() => {
        const fetchBatches = async () => {
            try {
                // Fetch batches without department constraint first
                const fetchedBatches = await getAvailableBatches();
                setAvailableBatches(prev => {
                    const combined = [...new Set([...DEFAULT_BATCHES, ...fetchedBatches])];
                    return combined.sort((a, b) => a.localeCompare(b));
                });
            } catch (error) {
                console.error('Error fetching available batches:', error);
            }
        };

        fetchBatches();
    }, []);

    // Effect to handle backward compatibility or direct URL access if we needed it, 
    // but for now we prioritize the new flow. We can initialize if params exist.
    useEffect(() => {
        if (paramDept && paramSem) {
            // If accessed via old URL, we might want to map it, but we lack Batch.
            // So we just let the user select Batch first, but maybe pre-select Dept/Sem if possible?
            // For simplicity and correctness with the new flow, we urge the user to start from Batch.
            // However, we can pre-set them and if the user picks a batch, we jump to step 4?
            // Let's stick to the flow: Batch is required first. 
            // We can pre-fill state but keep step at 1.
            setSelectedDepartment(paramDept);
            const semNum = paramSem.replace('semester-', '');
            setSelectedSemester(semNum);
        }
    }, [paramDept, paramSem]);


    // Load subjects when all selections are made (entering Step 4)
    useEffect(() => {
        if (currentStep === 4 && selectedBatch && selectedDepartment && selectedSemester) {
            loadSubjects();
        }
    }, [currentStep, selectedBatch, selectedDepartment, selectedSemester]);

    const loadSubjects = async () => {
        setLoading(true);
        try {
            const semesterParam = `Sem-${selectedSemester}`;
            const deptName = getDepartmentName(selectedDepartment);
            const regulation = getRegulationForBatch(selectedBatch);

            const data = await getSubjects(semesterParam, deptName, selectedBatch, regulation);
            setSubjects(data);

            const initialGrades = {};
            data.forEach(subject => {
                initialGrades[subject._id] = '';
            });
            setGrades(initialGrades);
        } catch (error) {
            showAlert('Failed to load subjects for this selection.');
        } finally {
            setLoading(false);
        }
    };

    const showAlert = (message) => {
        setAlert({ show: true, message });
    };

    const hideAlert = () => {
        setAlert({ show: false, message: '' });
    };

    const getDepartmentName = (deptCode) => {
        const dept = departments.find(d => d.code === deptCode);
        return dept ? dept.shortName : deptCode.toUpperCase();
    };

    // --- Handlers ---

    const handleBatchSelect = (batch) => {
        setSelectedBatch(batch);
        setCurrentStep(2); // Move to Department selection
    };

    const handleDepartmentSelect = (deptCode) => {
        setSelectedDepartment(deptCode);
        setCurrentStep(3); // Move to Semester selection
    };

    const handleSemesterSelect = (sem) => {
        setSelectedSemester(sem);
        setCurrentStep(4); // Move to Calculator
    };

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(prev => prev - 1);
            setSgpa(null); // Reset result if going back
        }
    };

    const handleGradeChange = (subjectId, value) => {
        setGrades({ ...grades, [subjectId]: value });
    };

    const validateRegNo = () => {
        if (username.trim().length !== 12) {
            showAlert('Register number must be exactly 12 digits');
            return false;
        }
        if (!username.startsWith('714')) {
            showAlert('Enter your Correct Register Number');
            return false;
        }
        return true;
    };

    const calculateSGPA = async () => {
        if (!validateRegNo()) return;

        const allSelected = subjects.every(subject => grades[subject._id] !== '');
        if (!allSelected) {
            showAlert('Please select grades for all subjects');
            return;
        }

        let totalCredits = 0;
        let weightedGradeSum = 0;
        const gradesForSubmission = {};

        subjects.forEach(subject => {
            const grade = parseInt(grades[subject._id]);
            gradesForSubmission[subject.label] = grade;

            if (grade > 0) {
                weightedGradeSum += grade * subject.credit;
                totalCredits += subject.credit;
            }
        });

        if (totalCredits === 0) {
            showAlert('SGPA cannot be calculated (all subjects failed).');
            return;
        }

        const calculatedSGPA = (weightedGradeSum / totalCredits).toFixed(3);
        setSgpa(calculatedSGPA);
        const newGreeting = fireCelebration(calculatedSGPA);
        setGreeting(newGreeting);

        try {
            const title = `Sem-${selectedSemester} ${getDepartmentName(selectedDepartment)}`;
            const regulation = getRegulationForBatch(selectedBatch);

            await submitCGPA({
                title,
                username,
                grades: gradesForSubmission,
                cgpa: calculatedSGPA,
                batch: selectedBatch,
                regulation
            });
            showAlert('SGPA calculated successfully!');
        } catch (error) {
            showAlert('Error submitting data. Try again.');
            console.error(error);
        }
    };

    const downloadPDF = async () => {
        if (!sgpa) {
            showAlert('Please calculate your SGPA first.');
            return;
        }
        try {
            const semesterParam = `Sem-${selectedSemester}`;
            const deptName = getDepartmentName(selectedDepartment);
            const regulation = getRegulationForBatch(selectedBatch);

            await generatePDF(
                username,
                semesterParam,
                deptName,
                subjects,
                grades,
                sgpa,
                selectedBatch,
                regulation
            );
        } catch (error) {
            showAlert('Error generating PDF.');
        }
    };

    // --- Render Methods ---



    const renderStep1_Batch = () => (
        <div className="sgpa-calculator-page">
            <div className="page-hero">
                <h1 className="page-title">Select Batch</h1>
                <p className="page-subtitle">Choose your academic batch to proceed</p>
            </div>

            <div className="selection-grid batch-grid">
                {availableBatches.map((b) => (
                    <div
                        key={b}
                        onClick={() => handleBatchSelect(b)}
                        className="selection-card batch-card"
                    >
                        <div className="icon-wrapper">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                                <line x1="16" y1="2" x2="16" y2="6" />
                                <line x1="8" y1="2" x2="8" y2="6" />
                                <line x1="3" y1="10" x2="21" y2="10" />
                            </svg>
                        </div>
                        <div className="card-content">
                            <h3 className="card-title">{b}</h3>
                            <p className="card-subtitle">{getRegulationFullName(getRegulationForBatch(b))}</p>
                        </div>
                        <div className="card-arrow">
                            <svg viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderStep2_Department = () => (
        <div className="sgpa-calculator-page">

            <div className="page-hero">
                <h1 className="page-title">Select Department</h1>
                <p className="page-subtitle">Batch: {selectedBatch}</p>
            </div>

            <div className="selection-grid">
                {departments.map((dept) => (
                    <div
                        key={dept.code}
                        onClick={() => handleDepartmentSelect(dept.code)}
                        className="selection-card"
                    >
                        <div className="icon-wrapper">
                            <DepartmentIcon type={dept.icon} />
                        </div>
                        <div className="card-content">
                            <h3 className="card-title">{dept.shortName}</h3>
                            <p className="card-subtitle">{dept.name}</p>
                        </div>
                        <div className="card-arrow">
                            <svg viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderStep3_Semester = () => (
        <div className="sgpa-calculator-page">

            <div className="page-hero">
                <h1 className="page-title">Select Semester</h1>
                <p className="page-subtitle">{selectedBatch} • {getDepartmentName(selectedDepartment)}</p>
            </div>

            <div className="selection-grid">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                    <div
                        key={sem}
                        onClick={() => handleSemesterSelect(sem)}
                        className="selection-card"
                    >
                        <div className="icon-wrapper">
                            <span style={{ fontSize: '20px', fontWeight: '800' }}>{sem}</span>
                        </div>
                        <div className="card-content">
                            <h3 className="card-title">Semester {sem}</h3>
                            <p className="card-subtitle">Calculate SGPA</p>
                        </div>
                        <div className="card-arrow">
                            <svg viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderStep4_Calculator = () => (
        <>
            <div style={{
                maxWidth: '700px',
                margin: '0 auto 20px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '0 10px'
            }}>

                <div style={{ flex: 1, textAlign: 'right', fontSize: '13px', color: '#666' }}>
                    <span style={{ fontWeight: '700', color: '#1a4704' }}>{selectedBatch}</span> • {getDepartmentName(selectedDepartment)} • Sem {selectedSemester}
                </div>
            </div>

            {/* User Input Section */}
            <div style={{
                margin: '0 auto 20px',
                background: 'linear-gradient(135deg, #86d437 0%, #7bc930 100%)',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.15)',
                padding: '25px',
                borderRadius: '20px',
                width: '95%',
                maxWidth: '700px',
            }}>
                <h2 style={{
                    margin: '0 0 10px 0',
                    color: '#1a4704',
                    fontSize: '20px',
                    fontWeight: '700',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#1a4704' }}>
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                    Student Information
                </h2>

                <label htmlFor="username" style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontWeight: '700',
                    fontSize: '14px',
                    color: '#1a4704'
                }}>
                    Register Number
                </label>
                <input
                    type="text"
                    id="username"
                    value={username}
                    onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '');
                        if (val.length <= 12) setUsername(val);
                    }}
                    placeholder="Enter 12-digit register number"
                    required
                    style={{
                        width: '100%',
                        padding: '12px 16px',
                        borderRadius: '10px',
                        border: 'none',
                        fontSize: '15px',
                        background: '#fff',
                        boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.05)',
                        transition: 'all 0.2s'
                    }}
                />
            </div>

            {/* Subjects Grade Section */}
            {loading ? (
                <SkeletonLoader />
            ) : (
                <>
                    {subjects.length > 0 && (
                        <div className="subject-grades-container">
                            <h2 style={{
                                margin: '0 0 20px 0',
                                color: '#1a4704',
                                fontSize: '20px',
                                fontWeight: '700',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between'
                            }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#1a4704' }}>
                                        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                                        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                                    </svg>
                                    Subject Grades
                                </span>
                                <span style={{
                                    fontSize: '13px',
                                    background: 'rgba(255,255,255,0.3)',
                                    padding: '6px 14px',
                                    borderRadius: '20px',
                                    fontWeight: '600'
                                }}>
                                    {subjects.length} Subjects
                                </span>
                            </h2>

                            {subjects.map((subject) => (
                                <div key={subject._id} className="subject-grade-item">
                                    <div style={{ flex: 1 }}>
                                        <label htmlFor={subject._id} style={{
                                            fontWeight: '600',
                                            fontSize: '14px',
                                            color: '#222',
                                            display: 'block',
                                            marginBottom: '4px'
                                        }}>
                                            {subject.label}
                                        </label>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <span style={{
                                                fontSize: '12px',
                                                color: '#666',
                                                background: '#f0f0f0',
                                                padding: '2px 8px',
                                                borderRadius: '4px',
                                                display: 'inline-block'
                                            }}>
                                                {subject.credit} Credits
                                            </span>
                                            {isBlendedSubject(subject.label) && (
                                                <span style={{
                                                    fontSize: '10px',
                                                    color: '#0369a1',
                                                    background: '#e0f2fe',
                                                    padding: '2px 8px',
                                                    borderRadius: '4px',
                                                    fontWeight: '700',
                                                    textTransform: 'uppercase',
                                                    display: 'inline-block',
                                                    border: '1px solid #bae6fd'
                                                }}>
                                                    Blended
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <select
                                        id={subject._id}
                                        value={grades[subject._id]}
                                        onChange={(e) => handleGradeChange(subject._id, e.target.value)}
                                        required
                                        style={{
                                            padding: '10px 14px',
                                            borderRadius: '8px',
                                            border: '2px solid #ddd',
                                            background: '#fff',
                                            fontSize: '14px',
                                            fontWeight: '600',
                                            cursor: 'pointer',
                                            minWidth: '100px',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        {gradeOptions.map((opt, idx) => (
                                            <option key={idx} value={opt.value} disabled={opt.disabled}>
                                                {opt.text}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Empty State Message */}
                    {subjects.length === 0 && (
                        <div style={{
                            margin: '20px auto',
                            background: 'rgba(255, 255, 255, 0.9)',
                            padding: '30px',
                            borderRadius: '20px',
                            width: '95%',
                            maxWidth: '700px',
                            textAlign: 'center',
                            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)',
                            border: '2px dashed #04AA6D'
                        }}>
                            <div style={{ fontSize: '40px', marginBottom: '15px' }}>⏳</div>
                            <h3 style={{ color: '#1a4704', margin: '0 0 10px 0' }}>Data Will Be Updated Soon</h3>
                            <p style={{ color: '#666', fontSize: '14px', margin: 0 }}>
                                We are currently updating the subject database for this selection.
                            </p>
                        </div>
                    )}

                    {/* Calculate Button & Result */}
                    <div style={{
                        background: 'rgba(255, 255, 255, 0.95)',
                        padding: '30px',
                        width: '95%',
                        maxWidth: '700px',
                        margin: '20px auto',
                        borderRadius: '20px',
                        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
                        textAlign: 'center'
                    }}>
                        <button
                            onClick={calculateSGPA}
                            style={{
                                background: 'linear-gradient(135deg, #04AA6D 0%, #039962 100%)',
                                color: '#fff',
                                border: 'none',
                                padding: '16px 40px',
                                borderRadius: '12px',
                                fontSize: '16px',
                                fontWeight: '700',
                                cursor: 'pointer',
                                boxShadow: '0 4px 15px rgba(4, 170, 109, 0.3)',
                                transition: 'all 0.3s',
                                width: '100%',
                                maxWidth: '300px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '10px',
                                margin: '0 auto'
                            }}
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="4" y="2" width="16" height="20" rx="2"></rect>
                                <line x1="8" y1="6" x2="16" y2="6"></line>
                                <line x1="16" y1="14" x2="16" y2="14"></line>
                                <line x1="8" y1="14" x2="8" y2="14"></line>
                                <line x1="12" y1="14" x2="12" y2="14"></line>
                                <line x1="16" y1="18" x2="16" y2="18"></line>
                                <line x1="8" y1="18" x2="8" y2="18"></line>
                                <line x1="12" y1="18" x2="12" y2="18"></line>
                            </svg>
                            Calculate SGPA
                        </button>

                        {sgpa && (
                            <div style={{
                                marginTop: '25px',
                                padding: '25px',
                                background: 'linear-gradient(135deg, #86d437 0%, #7bc930 100%)',
                                borderRadius: '15px',
                                boxShadow: '0 4px 20px rgba(134, 212, 55, 0.3)',
                                animation: 'slideUp 0.5s ease-out'
                            }}>
                                <div style={{
                                    fontSize: '14px',
                                    color: '#1a4704',
                                    fontWeight: '600',
                                    marginBottom: '10px',
                                    textTransform: 'uppercase',
                                    letterSpacing: '1px'
                                }}>
                                    Your SGPA
                                </div>
                                <div style={{
                                    fontSize: '48px',
                                    fontWeight: '800',
                                    color: '#fff',
                                    textShadow: '0 2px 10px rgba(0,0,0,0.2)',
                                    letterSpacing: '2px'
                                }}>
                                    {sgpa}
                                </div>
                                <div style={{ fontSize: '13px', color: '#1a4704', marginTop: '10px', fontWeight: '600' }}>
                                    {greeting}
                                </div>
                            </div>
                        )}
                    </div>
                </>
            )}

            {sgpa && !loading && (
                <div style={{ textAlign: 'center', margin: '20px auto 30px', width: '95%', maxWidth: '700px' }}>
                    <button
                        onClick={downloadPDF}
                        style={{
                            background: 'linear-gradient(135deg, #fff 0%, #fafafa 100%)',
                            color: '#04AA6D',
                            border: '3px solid #04AA6D',
                            padding: '14px 35px',
                            borderRadius: '12px',
                            fontSize: '15px',
                            fontWeight: '700',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '10px'
                        }}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                            <polyline points="7 10 12 15 17 10"></polyline>
                            <line x1="12" y1="15" x2="12" y2="3"></line>
                        </svg>
                        Download PDF
                    </button>
                </div>
            )}
        </>
    );

    return (
        <div className="sgpa-page-wrapper">
            <Header
                customBack={currentStep > 1 ? handleBack : undefined}
                customBackLabel={
                    currentStep === 2 ? "Back to Batch" :
                        currentStep === 3 ? "Back to Department" :
                            currentStep === 4 ? "Back to Semester" :
                                undefined
                }
            />
            {/* Removed Loader */}
            <CustomAlert message={alert.message} show={alert.show} onClose={hideAlert} />

            <div className="sgpa-content-wrapper">
                {currentStep === 1 && renderStep1_Batch()}
                {currentStep === 2 && renderStep2_Department()}
                {currentStep === 3 && renderStep3_Semester()}
                {currentStep === 4 && renderStep4_Calculator()}
            </div>

            <Footer />
        </div>
    );
};


export default SGPACalculator;
