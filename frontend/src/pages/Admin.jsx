import { useState, useEffect, useCallback } from 'react';
import { login, verifyToken, getAllPhotos, uploadPhoto, updatePhoto, deletePhoto } from '../services/api';
import './Admin.css';

function Admin() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);
    const [loginForm, setLoginForm] = useState({ username: '', password: '' });
    const [loginError, setLoginError] = useState('');

    const [photos, setPhotos] = useState([]);
    const [uploadForm, setUploadForm] = useState({
        photo: null,
        title: '',
        description: '',
        tags: ''
    });
    const [uploadMessage, setUploadMessage] = useState('');
    const [selectedFileName, setSelectedFileName] = useState('');

    const checkAuth = useCallback(async () => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                await verifyToken();
                setIsAuthenticated(true);
            } catch (error) {
                localStorage.removeItem('token');
                setIsAuthenticated(false);
            }
        }
        setLoading(false);
    }, []);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoginError('');

        try {
            const data = await login(loginForm.username, loginForm.password);
            localStorage.setItem('token', data.token);
            setIsAuthenticated(true);
        } catch (error) {
            setLoginError('Identifiants incorrects');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        setIsAuthenticated(false);
    };

    const loadPhotos = useCallback(async () => {
        try {
            const data = await getAllPhotos();
            setPhotos(data);
        } catch (error) {
            console.error('Erreur lors du chargement des photos:', error);
        }
    }, []);

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    useEffect(() => {
        if (isAuthenticated) {
            loadPhotos();
        }
    }, [isAuthenticated, loadPhotos]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setUploadForm({ ...uploadForm, photo: file });
            setSelectedFileName(file.name);
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        setUploadMessage('');

        if (!uploadForm.photo) {
            setUploadMessage('error:Veuillez sélectionner une photo');
            return;
        }

        const formData = new FormData();
        formData.append('photo', uploadForm.photo);
        formData.append('title', uploadForm.title);
        formData.append('description', uploadForm.description);
        formData.append('tags', uploadForm.tags);

        try {
            await uploadPhoto(formData);
            setUploadMessage('success:Photo uploadée avec succès !');
            setUploadForm({ photo: null, title: '', description: '', tags: '' });
            setSelectedFileName('');
            document.getElementById('photo-input').value = '';
            loadPhotos();
        } catch (error) {
            setUploadMessage('error:Erreur lors de l\'upload');
            console.error(error);
        }
    };

    const toggleWeekPhoto = async (photo) => {
        try {
            await updatePhoto(photo.id, {
                ...photo,
                is_week_photo: photo.is_week_photo ? 0 : 1
            });
            loadPhotos();
        } catch (error) {
            console.error('Erreur lors de la mise à jour:', error);
        }
    };

    const toggleHeroPhoto = async (photo) => {
        try {
            await updatePhoto(photo.id, {
                ...photo,
                is_hero_photo: photo.is_hero_photo ? 0 : 1
            });
            loadPhotos();
        } catch (error) {
            console.error('Erreur lors de la mise à jour:', error);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer cette photo ?')) {
            try {
                await deletePhoto(id);
                loadPhotos();
            } catch (error) {
                console.error('Erreur lors de la suppression:', error);
            }
        }
    };

    if (loading) {
        return (
            <div style={{
                height: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.2rem',
                color: 'var(--text-light)'
            }}>
                Vérification...
            </div>
        );
    }

    // PAGE DE LOGIN
    if (!isAuthenticated) {
        return (
            <div className="admin-login-page">
                <div className="login-container">
                    <div className="login-header">
                        <h1>Admin</h1>
                        <p className="login-subtitle">Espace d'administration</p>
                    </div>

                    <form onSubmit={handleLogin} className="login-form">
                        <div className="form-group">
                            <label htmlFor="username">Identifiant</label>
                            <input
                                type="text"
                                id="username"
                                value={loginForm.username}
                                onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                                required
                                autoComplete="username"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="password">Mot de passe</label>
                            <input
                                type="password"
                                id="password"
                                value={loginForm.password}
                                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                                required
                                autoComplete="current-password"
                            />
                        </div>

                        {loginError && <p className="login-error">{loginError}</p>}

                        <button type="submit" className="btn btn-primary btn-login">
                            Se connecter
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    // DASHBOARD ADMIN
    const weekPhotosCount = photos.filter(p => p.is_week_photo).length;
    const heroPhotosCount = photos.filter(p => p.is_hero_photo).length;

    return (
        <div className="admin-page">
            {/* Header */}
            <div className="admin-header">
                <div className="container">
                    <div className="admin-header-content">
                        <div className="admin-title">
                            <h1>Dashboard</h1>
                            <p className="admin-subtitle">Gestion de votre portfolio</p>
                        </div>
                        <button onClick={handleLogout} className="btn-logout">
                            Déconnexion
                        </button>
                    </div>
                </div>
            </div>

            <div className="container">
                {/* Stats */}
                <div className="photos-stats">
                    <div className="stat-card">
                        <span className="stat-number">{photos.length}</span>
                        <span className="stat-label">Photos totales</span>
                    </div>
                    <div className="stat-card">
                        <span className="stat-number">{weekPhotosCount}</span>
                        <span className="stat-label">Photos de la semaine</span>
                    </div>
                    <div className="stat-card">
                        <span className="stat-number">{heroPhotosCount}</span>
                        <span className="stat-label">Photos d'accueil</span>
                    </div>
                </div>

                {/* Upload Section */}
                <section className="admin-section">
                    <h2 className="section-title">
                        <span className="section-icon">📤</span>
                        Uploader une nouvelle photo
                    </h2>

                    <form onSubmit={handleUpload} className="upload-form">
                        <div className="form-group">
                            <label>Photo *</label>
                            <div className="file-input-wrapper">
                                <label htmlFor="photo-input" className="file-input-label">
                                    <span>📷</span>
                                    <span>{selectedFileName || 'Choisir une photo'}</span>
                                </label>
                                <input
                                    type="file"
                                    id="photo-input"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="title">Titre</label>
                                <input
                                    type="text"
                                    id="title"
                                    value={uploadForm.title}
                                    onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                                    placeholder="Ex: Séance famille Dupont"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="tags">Tags (séparés par des virgules)</label>
                                <input
                                    type="text"
                                    id="tags"
                                    placeholder="grossesse, famille, nouveau-né"
                                    value={uploadForm.tags}
                                    onChange={(e) => setUploadForm({ ...uploadForm, tags: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="description">Description</label>
                            <textarea
                                id="description"
                                value={uploadForm.description}
                                onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
                                placeholder="Décrivez cette photo..."
                            />
                        </div>

                        <button type="submit" className="btn-primary">
                            Uploader la photo
                        </button>
                    </form>

                    {uploadMessage && (
                        <p className={`upload-message ${uploadMessage.startsWith('success:') ? 'success' : 'error'}`}>
                            {uploadMessage.split(':')[1]}
                        </p>
                    )}
                </section>

                {/* Photos Management */}
                <section className="admin-section">
                    <h2 className="section-title">
                        <span className="section-icon">📸</span>
                        Gestion des photos ({photos.length})
                    </h2>

                    {photos.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-icon">📷</div>
                            <p>Aucune photo pour le moment.</p>
                            <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
                                Commencez par uploader votre première photo !
                            </p>
                        </div>
                    ) : (
                        <div className="photos-grid">
                            {photos.map((photo) => (
                                <article key={photo.id} className="photo-card">
                                    <div className="photo-thumbnail">
                                        <img src={`/uploads/${photo.filename}`} alt={photo.title || photo.original_name} />
                                        {photo.is_week_photo === 1 && <span className="photo-badge week">⭐ Semaine</span>}
                                        {photo.is_hero_photo === 1 && <span className="photo-badge hero">🌟 Accueil</span>}
                                    </div>

                                    <div className="photo-info">
                                        <h3 className="photo-title">{photo.title || 'Sans titre'}</h3>
                                        {photo.description && (
                                            <p className="photo-description">{photo.description}</p>
                                        )}
                                        <div className="photo-meta">
                                            <span>📅 {new Date(photo.upload_date).toLocaleDateString('fr-FR')}</span>
                                            <span>📁 {photo.original_name}</span>
                                        </div>
                                        {photo.tags && (
                                            <div className="photo-tags">
                                                {photo.tags.split(',').map((tag, idx) => (
                                                    <span key={idx} className="photo-tag">{tag.trim()}</span>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div className="photo-actions">
                                        <button
                                            onClick={() => toggleHeroPhoto(photo)}
                                            className={photo.is_hero_photo ? 'btn-hero' : 'btn-secondary'}
                                        >
                                            {photo.is_hero_photo ? '🌟 Photo d\'accueil' : 'Accueil'}
                                        </button>
                                        <button
                                            onClick={() => toggleWeekPhoto(photo)}
                                            className={photo.is_week_photo ? 'btn-success' : 'btn-secondary'}
                                        >
                                            {photo.is_week_photo ? '⭐ Semaine' : 'Semaine'}
                                        </button>
                                        <button
                                            onClick={() => handleDelete(photo.id)}
                                            className="btn-danger"
                                        >
                                            🗑️ Supprimer
                                        </button>
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}

export default Admin;