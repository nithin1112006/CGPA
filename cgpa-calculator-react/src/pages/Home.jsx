import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './Home.css';

const Home = () => {
    const formatDate = () => {
        const options = { day: '2-digit', month: 'long', year: 'numeric' };
        return new Date().toLocaleDateString('en-GB', options);
    };

    return (
        <div className="home-page">
            <Header />

            <div className="home-content">
                {/* Hero Section */}
                <div className="hero-section">
                    <div className="hero-content">
                        <h1 className="hero-title">Academic Performance Calculator</h1>
                        <p className="hero-subtitle">Calculate your SGPA & CGPA with precision and ease</p>
                        <div className="hero-date">
                            <svg className="calendar-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                <line x1="16" y1="2" x2="16" y2="6"></line>
                                <line x1="8" y1="2" x2="8" y2="6"></line>
                                <line x1="3" y1="10" x2="21" y2="10"></line>
                            </svg>
                            <span>{formatDate()}</span>
                        </div>
                    </div>
                </div>

                {/* Calculator Cards Grid */}
                <div className="calculators-grid">
                    {/* SGPA Calculator Card */}
                    <div className="calculator-card">
                        <div className="card-header">
                            <div className="card-icon sgpa-icon">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                                    <path d="M2 17l10 5 10-5M2 12l10 5 10-5"></path>
                                </svg>
                            </div>
                            <h2 className="card-title">SGPA Calculator</h2>
                        </div>

                        <div className="card-body">
                            <p className="card-description">
                                Calculate your Semester Grade Point Average based on course grades and credits for a single semester.
                            </p>

                            <div className="features-list">
                                <div className="feature-item">
                                    <svg className="check-icon" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                    <span>Semester-wise calculation</span>
                                </div>
                                <div className="feature-item">
                                    <svg className="check-icon" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                    <span>Credit-based grading system</span>
                                </div>
                                <div className="feature-item">
                                    <svg className="check-icon" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                    <span>Download PDF report</span>
                                </div>
                            </div>

                            <div className="formula-box">
                                <div className="formula-label">Formula:</div>
                                <div className="formula-content">
                                    <span className="formula-text">SGPA = </span>
                                    <div className="fraction-wrapper">
                                        <span className="fraction-top">∑(Credit × Grade Point)</span>
                                        <span className="fraction-bottom">∑Credits</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="card-footer">
                            <Link className="calc-button sgpa-button" to="/calculate">
                                <span>Calculate SGPA</span>
                                <svg className="arrow-icon" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </Link>
                        </div>
                    </div>

                    {/* CGPA Calculator Card */}
                    <div className="calculator-card">
                        <div className="card-header">
                            <div className="card-icon cgpa-icon">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                                </svg>
                            </div>
                            <h2 className="card-title">CGPA Calculator</h2>
                        </div>

                        <div className="card-body">
                            <p className="card-description">
                                Calculate your Cumulative Grade Point Average across all completed semesters for overall performance.
                            </p>

                            <div className="features-list">
                                <div className="feature-item">
                                    <svg className="check-icon" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                    <span>Overall academic performance</span>
                                </div>
                                <div className="feature-item">
                                    <svg className="check-icon" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                    <span>Multi-semester analysis</span>
                                </div>
                                <div className="feature-item">
                                    <svg className="check-icon" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                    <span>Flexible semester input</span>
                                </div>
                            </div>

                            <div className="formula-box">
                                <div className="formula-label">Formula:</div>
                                <div className="formula-content">
                                    <span className="formula-text">CGPA = </span>
                                    <div className="fraction-wrapper">
                                        <span className="fraction-top">∑(SGPA × Credits)</span>
                                        <span className="fraction-bottom">∑Total Credits</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="card-footer">
                            <Link className="calc-button cgpa-button" to="/cgpa">
                                <span>Calculate CGPA</span>
                                <svg className="arrow-icon" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Info Section */}
                <div className="info-section">
                    <div className="info-card">
                        <h3>🎓 About the Calculators</h3>
                        <p>
                            Our SGPA and CGPA calculators are designed specifically for students to easily track and calculate
                            their academic performance. Simply input your grades and credits to get instant, accurate results.
                        </p>
                    </div>
                </div>

                {/* Quick Links */}
                <div className="quick-links">
                    <Link to="/developer" className="quick-link-btn developer-btn">
                        <svg className="link-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                            <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                        <span>Developer Info</span>
                    </Link>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default Home;
