import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
    const location = useLocation();
    const isHomePage = location.pathname === '/';

    // Simple footer for non-home pages
    if (!isHomePage) {
        return (
            <footer className="simple-footer">
                <div className="simple-footer-content">
                    <p>© {new Date().getFullYear()} SIET. All Rights Reserved.</p>
                </div>
            </footer>
        );
    }

    // Full footer for home page
    return (
        <footer className="main-footer">
            <div className="footer-container">
                {/* Footer Top Section */}
                <div className="footer-top">
                    <div className="footer-section">
                        <h3 className="footer-title">About SIET</h3>
                        <p className="footer-description">
                            Sri Shakthi Institute of Engineering and Technology - An Autonomous Institution
                            committed to excellence in technical education.
                        </p>
                    </div>

                    <div className="footer-section">
                        <h3 className="footer-title">Quick Links</h3>
                        <ul className="footer-links">
                            <li><Link to="/">Home</Link></li>
                            <li><Link to="/calculate">SGPA Calculator</Link></li>
                            <li><Link to="/cgpa">CGPA Calculator</Link></li>
                            <li><Link to="/developer">Developer Info</Link></li>

                        </ul>
                    </div>

                    <div className="footer-section developer-info">
                        <h3 className="footer-title">Developer</h3>
                        <p className="footer-description">Developed by CSE-C 2rd Year Student</p>
                    </div>


                </div>

                {/* Footer Bottom Section */}
                <div className="footer-bottom">

                    <div className="footer-copyright">
                        <p>© {new Date().getFullYear()} Sri Shakthi Institute of Engineering and Technology. All Rights Reserved.</p>
                    </div>

                </div>
            </div>
        </footer>
    );
};

export default Footer;
