import { useState, useEffect } from 'react';
import { getAllPhotos, getPhotosByTag } from '../services/api';
import './Gallery.css';

function Gallery() {
    const [photos, setPhotos] = useState([]);
    const [allPhotos, setAllPhotos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedTag, setSelectedTag] = useState('all');
    const [availableTags, setAvailableTags] = useState([]);

    // État pour le lightbox
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState(0);

    useEffect(() => {
        loadAllPhotos();
    }, []);

    const loadAllPhotos = async () => {
        try {
            setLoading(true);
            const data = await getAllPhotos();
            setPhotos(data);
            setAllPhotos(data);
            extractTags(data);
        } catch (err) {
            setError('Erreur lors du chargement des photos');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const extractTags = (photosData) => {
        const tagsSet = new Set();
        photosData.forEach(photo => {
            if (photo.tags) {
                photo.tags.split(',').forEach(tag => {
                    tagsSet.add(tag.trim());
                });
            }
        });
        setAvailableTags(Array.from(tagsSet).sort());
    };

    const filterByTag = async (tag) => {
        setSelectedTag(tag);
        if (tag === 'all') {
            setPhotos(allPhotos);
            return;
        }

        try {
            setLoading(true);
            const data = await getPhotosByTag(tag);
            setPhotos(data);
        } catch (err) {
            setError('Erreur lors du filtrage');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Ouvrir le lightbox
    const openLightbox = (index) => {
        setLightboxIndex(index);
        setLightboxOpen(true);
        document.body.style.overflow = 'hidden'; // Empêcher le scroll
    };

    // Fermer le lightbox
    const closeLightbox = () => {
        setLightboxOpen(false);
        document.body.style.overflow = 'auto';
    };

    // Navigation dans le lightbox
    const goToPrevious = () => {
        setLightboxIndex((prev) => (prev === 0 ? photos.length - 1 : prev - 1));
    };

    const goToNext = () => {
        setLightboxIndex((prev) => (prev === photos.length - 1 ? 0 : prev + 1));
    };

    // Keyboard navigation
    useEffect(() => {
        const handleKeyPress = (e) => {
            if (!lightboxOpen) return;

            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowLeft') goToPrevious();
            if (e.key === 'ArrowRight') goToNext();
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [lightboxOpen, lightboxIndex]);

    // Animations au scroll
    useEffect(() => {
        if (loading) return;

        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, observerOptions);

        const items = document.querySelectorAll('.gallery-item');
        items.forEach((item, index) => {
            item.style.opacity = '0';
            item.style.transform = 'translateY(30px)';
            item.style.transition = `all 0.6s ease-out ${index * 0.05}s`;
            observer.observe(item);
        });

        return () => observer.disconnect();
    }, [loading, photos]);

    if (loading && photos.length === 0) {
        return (
            <div className="gallery-loading">
                Chargement de la galerie...
            </div>
        );
    }

    if (error) {
        return (
            <div className="container" style={{ paddingTop: '100px' }}>
                <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>
            </div>
        );
    }

    return (
        <>
            {/* Hero */}
            <section className="gallery-hero">
                <div className="gallery-hero-content">
                    <h1>Portfolio</h1>
                    <div className="gallery-hero-intro">
                        <p>
                            Je suis Sandy, du Studio Sandy's Art Photographies. Mon approche se veut douce et épurée.
                            Passionnée par les détails, je mets à profit plus de 15 ans d'expérience pour capturer des
                            instants authentiques, chargés d'émotion et de sincérité.
                        </p>
                        <p>
                            Mon objectif ? Vous sublimer et rendre vos souvenirs uniques. Chaque image raconte une histoire…
                            La vôtre.
                        </p>
                    </div>
                </div>
            </section>

            {/* Filtres */}
            {availableTags.length > 0 && (
                <div className="gallery-filters">
                    <div className="container">
                        <div className="filters-wrapper">
                            <span className="filter-label">Filtrer</span>
                            <button
                                className={selectedTag === 'all' ? 'filter-btn active' : 'filter-btn'}
                                onClick={() => filterByTag('all')}
                            >
                                Tout voir ({allPhotos.length})
                            </button>
                            {availableTags.map((tag) => (
                                <button
                                    key={tag}
                                    className={selectedTag === tag ? 'filter-btn active' : 'filter-btn'}
                                    onClick={() => filterByTag(tag)}
                                >
                                    {tag}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Résultats */}
            <div className="gallery-content">
                <div className="container">
                    {loading ? (
                        <div className="gallery-loading">Chargement...</div>
                    ) : photos.length === 0 ? (
                        <div className="gallery-empty">
                            <div className="gallery-empty-icon">📸</div>
                            <p>Aucune photo à afficher pour cette catégorie</p>
                        </div>
                    ) : (
                        <>
                            <div className="results-info">
                                <p className="results-count">
                                    <strong>{photos.length}</strong> {photos.length > 1 ? 'photographies' : 'photographie'}
                                    {selectedTag !== 'all' && ` · ${selectedTag}`}
                                </p>
                            </div>

                            <div className="gallery-grid">
                                {photos.map((photo, index) => (
                                    <article
                                        key={photo.id}
                                        className="gallery-item"
                                        onClick={() => openLightbox(index)}
                                    >
                                        <div className="gallery-item-image">
                                            <img
                                                src={`/uploads/${photo.filename}`}
                                                alt={photo.title || photo.original_name}
                                                loading="lazy"
                                            />
                                        </div>
                                        {(photo.title || photo.description || photo.tags) && (
                                            <div className="gallery-item-overlay">
                                                {photo.title && <h3>{photo.title}</h3>}
                                                {photo.description && <p>{photo.description}</p>}
                                                {photo.tags && (
                                                    <div className="gallery-tags">
                                                        {photo.tags.split(',').map((tag, idx) => (
                                                            <span key={idx} className="gallery-tag">{tag.trim()}</span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </article>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Lightbox */}
            {lightboxOpen && photos[lightboxIndex] && (
                <div className="lightbox" onClick={closeLightbox}>
                    <button className="lightbox-close" onClick={closeLightbox}>
                        ✕
                    </button>

                    {photos.length > 1 && (
                        <>
                            <button
                                className="lightbox-nav lightbox-prev"
                                onClick={(e) => { e.stopPropagation(); goToPrevious(); }}
                            >
                                ‹
                            </button>
                            <button
                                className="lightbox-nav lightbox-next"
                                onClick={(e) => { e.stopPropagation(); goToNext(); }}
                            >
                                ›
                            </button>
                        </>
                    )}

                    <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
                        <img
                            src={`/uploads/${photos[lightboxIndex].filename}`}
                            alt={photos[lightboxIndex].title || photos[lightboxIndex].original_name}
                            className="lightbox-image"
                        />
                    </div>

                    {(photos[lightboxIndex].title || photos[lightboxIndex].description) && (
                        <div className="lightbox-info">
                            {photos[lightboxIndex].title && <h3>{photos[lightboxIndex].title}</h3>}
                            {photos[lightboxIndex].description && <p>{photos[lightboxIndex].description}</p>}
                        </div>
                    )}
                </div>
            )}
        </>
    );
}

export default Gallery;