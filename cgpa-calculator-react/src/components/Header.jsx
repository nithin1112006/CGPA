import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import './Header.css';

const Header = ({ customBack, customBackLabel }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [showScrollTop, setShowScrollTop] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);

    const showNavigation = location.pathname !== '/';

    const formatDate = () => {
        const options = { day: '2-digit', month: 'short', year: 'numeric' };
        return new Date().toLocaleDateString('en-GB', options);
    };

    // Track scroll position for header shadow and scroll-to-top button
    useEffect(() => {
        const handleScroll = () => {
            const scrollPosition = window.scrollY;
            setIsScrolled(scrollPosition > 10);
            setShowScrollTop(scrollPosition > 300);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Get page name for navigation context
    const getPageName = () => {
        const path = location.pathname;
        if (path === '/') return 'Home';
        if (path === '/calculate') return 'Select Department';
        if (path === '/cgpa') return 'CGPA Calculator';

        if (path === '/admin') return 'Admin Panel';
        if (path.includes('/calculate/') && path.includes('/semester-')) return 'SGPA Calculator';
        if (path.includes('/calculate/')) return 'Select Semester';
        return 'CGPA Calculator';
    };

    return (
        <>
            <header className={`main-header ${isScrolled ? 'scrolled' : ''}`}>
                <div className="header-container">
                    <div className="header-logo-section">
                        <img src="/images/logo.png" alt="SIET Logo" className="header-logo" />
                    </div>

                    <div className="header-title-section">
                        <h1 className="header-title">
                            Sri Shakthi Institute of Engineering and Technology
                        </h1>
                        <p className="header-subtitle">An Autonomous Institution</p>
                    </div>

                    <div className="header-badge-section">
                        <img src="/images/Naac logo" alt="NAAC Accreditation" className="header-badge" />
                    </div>
                </div>
            </header>

            {showNavigation && (
                <nav className="navigation-bar">
                    <div className="nav-content">
                        <div className="nav-controls">
                            <button
                                className="nav-btn back-btn"
                                onClick={customBack || (() => navigate(-1))}
                                aria-label="Go back"
                            >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M19 12H5M12 19l-7-7 7-7" />
                                </svg>
                                <span>{customBackLabel || 'Back'}</span>
                            </button>

                            <Link to="/" className="nav-btn home-btn" aria-label="Go to home">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                                    <polyline points="9 22 9 12 15 12 15 22" />
                                </svg>
                                <span>Home</span>
                            </Link>
                        </div>

                        <div className="nav-page-info">
                            <span className="current-page">{getPageName()}</span>
                        </div>

                        <div className="nav-date">
                            <svg className="calendar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                                <line x1="16" y1="2" x2="16" y2="6" />
                                <line x1="8" y1="2" x2="8" y2="6" />
                                <line x1="3" y1="10" x2="21" y2="10" />
                            </svg>
                            <span className="date-text">{formatDate()}</span>
                        </div>
                    </div>
                </nav>
            )}

            {/* Scroll to Top Button */}
            {showScrollTop && (
                <button
                    className="scroll-to-top"
                    onClick={scrollToTop}
                    aria-label="Scroll to top"
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 15l-6-6-6 6" />
                    </svg>
                </button>
            )}
        </>
    );
};

export default Header;
