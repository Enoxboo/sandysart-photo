import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { getWeekPhotos, getHeroPhotos } from '../services/api';
import { getSrcSet } from '../utils/images';
import './Home.css';
import SEO from '../components/SEO';

function Home() {
    const [photos, setPhotos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // État pour le carrousel
    const [currentSlide, setCurrentSlide] = useState(0);
    const [carouselPhotos, setCarouselPhotos] = useState([]);
    const timerRef = useRef(null);

    useEffect(() => {
        loadPhotos();
    }, []);

    const loadPhotos = async () => {
        try {
            setLoading(true);
            const [weekData, heroData] = await Promise.all([
                getWeekPhotos(),
                getHeroPhotos()
            ]);

            setPhotos(weekData);
            setCarouselPhotos(heroData);
        } catch (err) {
            setError('Erreur lors du chargement des photos');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Carrousel automatique
    useEffect(() => {
        if (carouselPhotos.length > 1) {
            timerRef.current = setInterval(() => {
                setCurrentSlide((prev) => (prev + 1) % carouselPhotos.length);
            }, 5000); // Change toutes les 5 secondes

            return () => clearInterval(timerRef.current);
        }
    }, [carouselPhotos.length]);

    const goToSlide = (index) => {
        setCurrentSlide(index);
        // Reset le timer quand on clique manuellement
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = setInterval(() => {
                setCurrentSlide((prev) => (prev + 1) % carouselPhotos.length);
            }, 5000);
        }
    };

    // Hook pour animations au scroll
    useEffect(() => {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -100px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, observerOptions);

        // Observer tous les éléments avec classe fade-in
        const elements = document.querySelectorAll('.fade-in, .fade-in-left, .fade-in-right, .scale-in');
        elements.forEach(el => observer.observe(el));

        return () => observer.disconnect();
    }, [loading]);

    if (loading) {
        return <div className="page-loading">Chargement...</div>;
    }

    if (error) {
        return (
            <div className="container page-error-container">
                <p className="page-error-message">{error}</p>
            </div>
        );
    }

    return (
        <>
            {/* ← Composant SEO : met à jour toutes les balises meta pour cette page */}
            <SEO
                title="Accueil"
                description="Photographe professionnelle au Vernet. Spécialisée en photos de famille, nouveaux nés, grossesse, mariage. Plus de 15 ans d'expérience. Tarifs accessibles."
            />
            {/* Hero Carousel */}
            <section className="hero-carousel">
                {carouselPhotos.length > 0 ? (
                    <>
                        {carouselPhotos.map((photo, index) => (
                            <div
                                key={photo.id}
                                className={`carousel-slide ${index === currentSlide ? 'active' : ''}`}
                            >
                                <img
                                    src={`/uploads/${photo.filename}`}
                                    srcSet={getSrcSet(photo)}
                                    sizes="100vw"
                                    alt={photo.title || 'Photo portfolio'}
                                    fetchpriority={index === 0 ? 'high' : 'low'}
                                />
                            </div>
                        ))}

                        <div className="hero-overlay">
                            <h1>Sandy's Art</h1>
                            <h1>Photographies</h1>
                            <p>Photographe de l'émotion et de l'authenticité</p>
                            <Link to="/gallery" className="btn btn-light">
                                Découvrir mon travail
                            </Link>
                        </div>

                        {/* Indicateurs */}
                        {carouselPhotos.length > 1 && (
                            <div className="carousel-indicators">
                                {carouselPhotos.map((_, index) => (
                                    <button
                                        key={index}
                                        className={`carousel-indicator ${index === currentSlide ? 'active' : ''}`}
                                        onClick={() => goToSlide(index)}
                                        aria-label={`Slide ${index + 1}`}
                                        aria-current={index === currentSlide ? 'true' : undefined}
                                    />
                                ))}
                            </div>
                        )}
                    </>
                ) : (
                    // Fallback si pas de photos hero
                    <div className="hero-overlay" style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--black) 100%)' }}>
                        <h1>Sandy's Art</h1>
                        <h1>Photographies</h1>
                        <p>Photographe de l'émotion et de l'authenticité</p>
                        <Link to="/gallery" className="btn btn-light">
                            Découvrir mon travail
                        </Link>
                        <p style={{ marginTop: '2rem', fontSize: '0.9rem', opacity: 0.7 }}>
                            Aucune photo d'accueil sélectionnée pour le moment
                        </p>
                    </div>
                )}
            </section>

            {/* Section intro */}
            <section className="intro-section fade-in">
                <div className="container">
                    <h2>Capturez l'essence de vos moments précieux</h2>
                    <p>
                        Chaque instant de votre vie mérite d'être immortalisé avec authenticité et émotion.
                        Mon approche photographique se concentre sur la capture de moments naturels et sincères,
                        créant des souvenirs intemporels qui racontent votre histoire unique.
                    </p>
                    <p>
                        Spécialisée dans la photographie de famille, de grossesse et de nouveau-nés,
                        je crée des images qui célèbrent l'amour, la connexion et la beauté de la vie.
                    </p>
                </div>
            </section>

            {/* Photos de la semaine - Grille Mosaïque */}
            {photos.length > 0 && (
                <section className="featured-section">
                    <div className="container">
                        <div className="section-title fade-in">
                            <h2>Sélection du moment</h2>
                        </div>

                        <div className="masonry-grid">
                            {photos.map((photo, index) => (
                                <article
                                    key={photo.id}
                                    className="masonry-item scale-in"
                                    style={{ animationDelay: `${index * 0.1}s` }}
                                >
                                    <img
                                        src={`/uploads/${photo.filename}`}
                                        srcSet={getSrcSet(photo)}
                                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                        alt={photo.title || photo.original_name}
                                        loading="lazy"
                                    />
                                    {(photo.title || photo.description) && (
                                        <div className="masonry-item-overlay">
                                            {photo.title && <h3>{photo.title}</h3>}
                                            {photo.description && <p>{photo.description}</p>}
                                        </div>
                                    )}
                                </article>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* CTA Simple */}
            <section className="cta-simple fade-in">
                <div className="container">
                    <h2>Prête à raconter votre histoire ?</h2>
                    <p>
                        Réservez votre séance photo et créons ensemble des souvenirs
                        qui dureront toute une vie.
                    </p>
                    <Link to="/contact" className="btn">
                        Me contacter
                    </Link>
                </div>
            </section>
        </>
    );
}

export default Home;