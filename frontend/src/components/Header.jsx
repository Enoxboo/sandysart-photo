import { Link } from 'react-router-dom';
import './Header.css';

function Header() {
    return (
        <header className="header">
            <div className="container">
                <nav className="nav">
                    <Link to="/" className="logo">
                        <h1>Sandy's Art Photography</h1>
                    </Link>

                    <ul className="nav-links">
                        <li><Link to="/">Accueil</Link></li>
                        <li><Link to="/gallery">Galerie</Link></li>
                        <li><Link to="/about">À propos</Link></li>
                        <li><Link to="/admin">Admin</Link></li>
                    </ul>
                </nav>
            </div>
        </header>
    );
}

export default Header;