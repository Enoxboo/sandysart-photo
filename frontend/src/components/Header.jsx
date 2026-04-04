import {Link, useLocation} from 'react-router-dom';
import {useEffect, useState} from 'react';
import './Header.css';

function Header() {
    const location = useLocation();
    const [scrolled, setScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        setMenuOpen(false);
    }, [location]);

    useEffect(() => {
        document.body.style.overflow = menuOpen ? 'hidden' : '';
        return () => {
            document.body.style.overflow = '';
        };
    }, [menuOpen]);

    return (
        <header className={`header ${scrolled ? 'scrolled' : ''} ${menuOpen ? 'menu-open' : ''}`}>
            <div className="container">
                <nav className="nav">
                    <Link to="/" className="logo">
                        <h1>Sandy's Art Photographies</h1>
                    </Link>

                    {/* Burger button — mobile only */}
                    <button
                        className="burger"
                        onClick={() => setMenuOpen(!menuOpen)}
                        aria-label={menuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
                        aria-expanded={menuOpen}
                    >
                        <span></span>
                        <span></span>
                        <span></span>
                    </button>

                    {/* Nav links */}
                    <ul className={`nav-links ${menuOpen ? 'nav-open' : ''}`}>
                        <li>
                            <Link to="/" className={location.pathname === '/' ? 'active' : ''}>
                                Accueil
                            </Link>
                        </li>
                        <li>
                            <Link to="/gallery" className={location.pathname === '/gallery' ? 'active' : ''}>
                                Portfolio
                            </Link>
                        </li>
                        <li>
                            <Link to="/about" className={location.pathname === '/about' ? 'active' : ''}>
                                À propos
                            </Link>
                        </li>
                        <li>
                            <Link to="/contact"
                                  className={`nav-contact-btn ${location.pathname === '/contact' ? 'active' : ''}`}>
                                Contact
                            </Link>
                        </li>
                    </ul>
                </nav>
            </div>
        </header>
    );
}

export default Header;