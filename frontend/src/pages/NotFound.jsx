import {Link} from 'react-router-dom';
import SEO from '../components/SEO';

function NotFound() {
    return (
        <>
            <SEO
                title="Page introuvable"
                description="Cette page n'existe pas."
            />
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                padding: '2rem',
                background: 'var(--background)'
            }}>
                <p style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: 'clamp(6rem, 20vw, 12rem)',
                    fontWeight: '300',
                    color: 'var(--accent)',
                    lineHeight: '1',
                    margin: '0 0 1rem'
                }}>
                    404
                </p>
                <h1 style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
                    fontWeight: '300',
                    letterSpacing: '4px',
                    color: 'var(--text-primary)',
                    margin: '0 0 1rem'
                }}>
                    Page introuvable
                </h1>
                <p style={{
                    color: 'var(--text-light)',
                    marginBottom: '2.5rem',
                    fontWeight: '300'
                }}>
                    Cette page n'existe pas ou a été déplacée.
                </p>
                <Link to="/" className="btn">
                    Retour à l'accueil
                </Link>
            </div>
        </>
    );
}

export default NotFound;