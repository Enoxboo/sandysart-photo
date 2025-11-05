import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="footer-content">
                <p>© 2025 Sandy's Art Photography - Tous droits réservés</p>
                <div className="footer-legal">
                    <Link to="/rgpd">RGPD & Confidentialité</Link>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
