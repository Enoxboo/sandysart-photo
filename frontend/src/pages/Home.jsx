import { useState, useEffect } from 'react';
import { getWeekPhotos } from '../services/api';
import './Home.css';

function Home() {
    const [photos, setPhotos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Charger les photos au montage du composant
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
            <section className="hero">
                <h1>Bienvenue chez Sandy's Art Photography</h1>
                <p>Capturez vos moments précieux avec passion et professionnalisme</p>
            </section>

            <section className="week-photos">
                <h2>Photos de la semaine</h2>
                {photos.length === 0 ? (
                    <p>Aucune photo de la semaine pour le moment.</p>
                ) : (
                    <div className="photos-grid">
                        {photos.map((photo) => (
                            <div key={photo.id} className="photo-card">
                                <img
                                    src={`/uploads/${photo.filename}`}
                                    alt={photo.title || photo.original_name}
                                />
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
                        ))}
                    </div>
                )}
            </section>

            <section className="services">
                <h2>Nos services</h2>
                <div className="services-grid">
                    <div className="service">
                        <h3>📸 Portraits</h3>
                        <p>Des portraits qui capturent votre personnalité unique</p>
                    </div>
                    <div className="service">
                        <h3>👶 Grossesse & Nouveau-né</h3>
                        <p>Immortalisez ces moments magiques</p>
                    </div>
                    <div className="service">
                        <h3>👨‍👩‍👧‍👦 Famille</h3>
                        <p>Créez des souvenirs familiaux inoubliables</p>
                    </div>
                    <div className="service">
                        <h3>💍 Mariage</h3>
                        <p>Votre jour spécial capturé avec élégance</p>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default Home;