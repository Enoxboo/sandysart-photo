import { Link } from 'react-router-dom';
import './Footer.css';

function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="footer">
            <div className="container">
                <div className="footer-content">

                    {/* Colonne 1 - Branding */}
                    <div className="footer-column">
                        <h3 className="footer-brand">Sandy's Art</h3>
                        <p className="footer-tagline">
                            Photographe de l'émotion<br />et de l'authenticité
                        </p>
                    </div>

                    {/* Colonne 2 - Navigation */}
                    <div className="footer-column">
                        <h4 className="footer-title">Navigation</h4>
                        <nav className="footer-nav">
                            <Link to="/">Accueil</Link>
                            <Link to="/gallery">Portfolio</Link>
                            <Link to="/about">À propos</Link>
                            <Link to="/admin">Contact</Link>
                        </nav>
                    </div>

                    {/* Colonne 3 - Contact */}
                    <div className="footer-column">
                        <h4 className="footer-title">Contact</h4>
                        <div className="footer-contact">
                            <a href="mailto:sandysartphotographies@hotmail.com">
                                sandysartphotographies@hotmail.com
                            </a>
                            <a href="tel:+33684902214">06 84 90 22 14</a>
                            <p>Vernet, France</p>
                        </div>
                    </div>

                    {/* Colonne 4 - Réseaux (optionnel pour plus tard) */}
                    <div className="footer-column">
                        <h4 className="footer-title">Suivez-moi</h4>
                        <div className="footer-social">
                            <a href="#" className="social-link" aria-label="Instagram">📷</a>
                            <a href="#" className="social-link" aria-label="Facebook">📘</a>
                            {/* Remplace les # par les vrais liens quand Sandy les donnera */}
                        </div>
                    </div>

                </div>

                {/* Barre du bas */}
                <div className="footer-bottom">
                    <p className="footer-copyright">
                        © {currentYear} Sandy's Art Photography. Tous droits réservés.
                    </p>
                    <div className="footer-legal">
                        <Link to="/rgpd">RGPD & Confidentialité</Link>
                        <span className="footer-separator">·</span>
                        <Link to="/rgpd#mentions">Mentions légales</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}

export default Footer;