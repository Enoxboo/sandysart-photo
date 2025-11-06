import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getWeekPhotos } from '../services/api';
import './Home.css';

function Home() {
    const [photos, setPhotos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadPhotos();
    }, []);

    const loadPhotos = async () => {
        try {
            setLoading(true);
            const data = await getWeekPhotos();
            setPhotos(data);
        } catch (err) {
            setError('Erreur lors du chargement des photos');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="container">
                <p>Chargement des photos...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container">
                <p style={{ color: 'red' }}>{error}</p>
            </div>
        );
    }

    return (
        <div className="container">
            {/* Hero Section */}
            <section className="hero">
                <div className="hero-content">
                    <h1>Capturez vos moments précieux</h1>
                    <p className="hero-subtitle">
                        Photographe professionnelle spécialisée dans les portraits de famille,
                        grossesse et nouveau-nés. Chaque instant mérite d'être immortalisé avec authenticité et émotion.
                    </p>
                    <div className="hero-cta">
                        <Link to="/gallery" className="hero-btn hero-btn-primary">
                            Découvrir la galerie
                        </Link>
                        <Link to="/about" className="hero-btn hero-btn-secondary">
                            En savoir plus
                        </Link>
                    </div>
                </div>
            </section>

            {/* Photos de la semaine */}
            <section className="week-photos">
                <div className="section-header">
                    <h2>Coups de cœur de la semaine</h2>
                    <p>Découvrez une sélection de mes photos préférées</p>
                </div>

                {photos.length === 0 ? (
                    <p style={{ textAlign: 'center', color: 'var(--text-light)' }}>
                        Aucune photo de la semaine pour le moment.
                    </p>
                ) : (
                    <div className="photos-grid">
                        {photos.map((photo) => (
                            <article key={photo.id} className="photo-card">
                                <div className="photo-card-image">
                                    <img
                                        src={`/uploads/${photo.filename}`}
                                        alt={photo.title || photo.original_name}
                                        loading="lazy"
                                    />
                                </div>
                                <div className="photo-card-content">
                                    {photo.title && <h3>{photo.title}</h3>}
                                    {photo.description && <p>{photo.description}</p>}
                                    {photo.tags && (
                                        <div className="tags">
                                            {photo.tags.split(',').map((tag, index) => (
                                                <span key={index} className="tag">{tag.trim()}</span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </section>

            {/* Services */}
            <section className="services">
                <div className="section-header">
                    <h2>Mes spécialités</h2>
                    <p>Un accompagnement personnalisé pour chaque moment de votre vie</p>
                </div>

                <div className="services-grid">
                    <div className="service">
                        <span className="service-icon">📸</span>
                        <h3>Portraits</h3>
                        <p>Des portraits qui capturent votre essence et votre personnalité unique avec authenticité</p>
                    </div>
                    <div className="service">
                        <span className="service-icon">🤰</span>
                        <h3>Grossesse</h3>
                        <p>Immortalisez cette période magique avec des photos pleines de douceur et d'émotion</p>
                    </div>
                    <div className="service">
                        <span className="service-icon">👶</span>
                        <h3>Nouveau-né</h3>
                        <p>Capturez les premiers jours de votre bébé avec des clichés tendres et intemporels</p>
                    </div>
                    <div className="service">
                        <span className="service-icon">👨‍👩‍👧‍👦</span>
                        <h3>Famille</h3>
                        <p>Des séances conviviales pour célébrer l'amour et la complicité de votre famille</p>
                    </div>
                </div>
            </section>
            {/* Call to Action */}
            <section className="cta-section">
                <div className="cta-content">
                    <h2>Prête à immortaliser vos souvenirs ?</h2>
                    <p>
                        Réservez votre séance photo dès maintenant et créez des souvenirs
                        qui dureront toute une vie.
                    </p>
                    <Link to="/about" className="cta-btn">
                        Contactez-moi
                    </Link>
                </div>
            </section>
        </div>
    );
}

export default Home;