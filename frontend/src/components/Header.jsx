import { Link, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import './Header.css';

function Header() {
    const location = useLocation();
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <header className={`header ${scrolled ? 'scrolled' : ''}`}>
            <div className="container">
                <nav className="nav">
                    <Link to="/" className="logo">
                        <h1>Sandy's Art Photographies</h1>
                    </Link>

                    <ul className="nav-links">
                        <li>
                            <Link
                                to="/"
                                className={location.pathname === '/' ? 'active' : ''}
                            >
                                Accueil
                            </Link>
                        </li>
                        <li>
                            <Link
                                to="/gallery"
                                className={location.pathname === '/gallery' ? 'active' : ''}
                            >
                                Portfolio
                            </Link>
                        </li>
                        <li>
                            <Link
                                to="/about"
                                className={location.pathname === '/about' ? 'active' : ''}
                            >
                                À propos
                            </Link>
                        </li>
                        <li>
                            <Link
                                to="/contact"
                                className={`nav-contact-btn ${location.pathname === '/contact' ? 'active' : ''}`}
                            >
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