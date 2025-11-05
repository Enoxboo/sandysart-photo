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

    // Charger toutes les photos au montage
    useEffect(() => {
        loadAllPhotos();
    }, []);

    const loadAllPhotos = async () => {
        try {
            setLoading(true);
            const data = await getAllPhotos();
            setPhotos(data);
            setAllPhotos(data);

            // Extraire tous les tags uniques
            extractTags(data);
        } catch (err) {
            setError('Erreur lors du chargement des photos');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Extraire les tags uniques de toutes les photos
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

    // Filtrer les photos par tag
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

    if (loading && photos.length === 0) {
        return (
            <div className="container">
                <p>Chargement de la galerie...</p>
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
            <section className="gallery-header">
                <h1>Créez aujourd'hui vos souvenirs de demain</h1>
                <div className="gallery-intro">
                    <p>
                        Je suis Sandy, du Studio Sandy's Art Photographies. Mon approche se veut douce et épurée.
                        Passionnée par les détails, je mets à profit plus de 15 ans d'expérience pour capturer des
                        instants authentiques, chargés d'émotion et de sincérité.
                    </p>
                    <p>
                        Mon objectif ? Vous sublimer et rendre vos souvenirs uniques. Chaque image raconte une histoire… La vôtre.
                    </p>
                    <p>
                        Laissez-vous inspirer en explorant mon portfolio. Du shooting nouveau-né, enfants avec des décors
                        incroyables chaque année, famille, aux séances femmes enceinte, portrait de femme et couple,
                        je crée des souvenirs qui vous ressemblent.
                    </p>
                </div>
            </section>

            {/* Filtres par tags */}
            {availableTags.length > 0 && (
                <section className="filters">
                    <h3>Filtrer par catégorie :</h3>
                    <div className="filter-buttons">
                        <button
                            className={selectedTag === 'all' ? 'filter-btn active' : 'filter-btn'}
                            onClick={() => filterByTag('all')}
                        >
                            Toutes les photos ({allPhotos.length})
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
                </section>
            )}

            {/* Grille de photos */}
            <section className="gallery-grid-section">
                {loading ? (
                    <p>Chargement...</p>
                ) : photos.length === 0 ? (
                    <p>Aucune photo à afficher pour cette catégorie.</p>
                ) : (
                    <>
                        <p className="results-count">
                            {photos.length} photo{photos.length > 1 ? 's' : ''} {selectedTag !== 'all' && `dans "${selectedTag}"`}
                        </p>
                        <div className="gallery-grid">
                            {photos.map((photo) => (
                                <div key={photo.id} className="gallery-item">
                                    <img
                                        src={`/uploads/${photo.filename}`}
                                        alt={photo.title || photo.original_name}
                                        loading="lazy"
                                    />
                                    <div className="gallery-item-overlay">
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
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </section>
        </div>
    );
}

export default Gallery;
