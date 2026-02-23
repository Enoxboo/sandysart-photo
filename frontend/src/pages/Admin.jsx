import { useState, useEffect, useCallback } from 'react';
import { login, verifyToken, getAllPhotos, updatePhoto, deletePhoto } from '../services/api';
import './Admin.css';

async function uploadMultiplePhotos(files, tags, onProgress) {
    const formData = new FormData();

    files.forEach(file => {
        formData.append('photos', file);
    });

    if (tags && tags.trim()) {
        formData.append('tags', tags);
    }

    const token = localStorage.getItem('token');

    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.upload.addEventListener('progress', (e) => {
            if (e.lengthComputable && onProgress) {
                const percentComplete = Math.round((e.loaded / e.total) * 100);
                onProgress(percentComplete);
            }
        });

        xhr.addEventListener('load', () => {
            if (xhr.status >= 200 && xhr.status < 300) {
                resolve(JSON.parse(xhr.responseText));
            } else {
                reject(new Error(xhr.responseText || 'Erreur upload'));
            }
        });

        xhr.addEventListener('error', () => reject(new Error('Erreur réseau')));
        xhr.addEventListener('abort', () => reject(new Error('Upload annulé')));

        xhr.open('POST', '/api/photos/upload-multiple');
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
        xhr.send(formData);
    });
}

function Admin() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);
    const [loginForm, setLoginForm] = useState({ username: '', password: '' });
    const [loginError, setLoginError] = useState('');

    const [photos, setPhotos] = useState([]);

    // 🆕 NOUVEAUX ÉTATS POUR L'UPLOAD MULTIPLE
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [tags, setTags] = useState('');
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadResults, setUploadResults] = useState(null);

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

    // 🆕 GESTION DES FICHIERS
    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        setSelectedFiles(files);
        setUploadResults(null);
    };

    const removeFile = (index) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    };

    // 🆕 NOUVELLE FONCTION D'UPLOAD
    const handleUpload = async (e) => {
        e.preventDefault();

        if (selectedFiles.length === 0) {
            alert('Veuillez sélectionner au moins une photo');
            return;
        }

        setUploading(true);
        setUploadProgress(0);
        setUploadResults(null);

        try {
            const results = await uploadMultiplePhotos(
                selectedFiles,
                tags,
                (progress) => setUploadProgress(progress)
            );

            setUploadResults(results);
            setSelectedFiles([]);
            setTags('');

            // Réinitialiser l'input file
            const fileInput = document.getElementById('photo-input');
            if (fileInput) fileInput.value = '';

            // Recharger les photos
            loadPhotos();

        } catch (error) {
            console.error('Erreur upload:', error);
            setUploadResults({
                message: 'Erreur lors de l\'upload',
                total: selectedFiles.length,
                success: [],
                failed: selectedFiles.map(f => ({
                    filename: f.name,
                    error: error.message || 'Erreur inconnue'
                }))
            });
        } finally {
            setUploading(false);
            setUploadProgress(0);
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

                {/* 🆕 NOUVELLE SECTION D'UPLOAD */}
                <section className="admin-section">
                    <h2 className="section-title">
                        <span className="section-icon">📤</span>
                        Uploader des photos
                    </h2>

                    <form onSubmit={handleUpload} className="upload-form">
                        {/* Sélection de fichiers */}
                        <div className="form-group">
                            <label>Photos *</label>
                            <div className="file-input-wrapper">
                                <label htmlFor="photo-input" className="file-input-label">
                                    <span>📷</span>
                                    <span>
                                        {selectedFiles.length === 0
                                            ? 'Choisir des photos'
                                            : `${selectedFiles.length} photo(s) sélectionnée(s)`}
                                    </span>
                                </label>
                                <input
                                    type="file"
                                    id="photo-input"
                                    accept="image/*"
                                    multiple
                                    onChange={handleFileChange}
                                    disabled={uploading}
                                />
                            </div>
                        </div>

                        {/* Liste des fichiers sélectionnés */}
                        {selectedFiles.length > 0 && (
                            <div className="selected-files">
                                <h3>Fichiers sélectionnés :</h3>
                                <ul className="file-list">
                                    {selectedFiles.map((file, index) => (
                                        <li key={index} className="file-item">
                                            <span className="file-name">{file.name}</span>
                                            <span className="file-size">
                                                {(file.size / 1024 / 1024).toFixed(2)} MB
                                            </span>
                                            {!uploading && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeFile(index)}
                                                    className="btn-remove"
                                                >
                                                    ✕
                                                </button>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Tags (optionnel) */}
                        <div className="form-group">
                            <label htmlFor="tags">Tags (optionnel)</label>
                            <input
                                type="text"
                                id="tags"
                                placeholder="grossesse, famille, nouveau-né..."
                                value={tags}
                                onChange={(e) => setTags(e.target.value)}
                                disabled={uploading}
                            />
                        </div>

                        {/* Barre de progression */}
                        {uploading && (
                            <div className="upload-progress">
                                <div className="progress-bar">
                                    <div
                                        className="progress-fill"
                                        style={{ width: `${uploadProgress}%` }}
                                    />
                                </div>
                                <p className="progress-text">Upload en cours... {uploadProgress}%</p>
                            </div>
                        )}

                        {/* Bouton d'upload */}
                        <button
                            type="submit"
                            className="btn-primary"
                            disabled={uploading || selectedFiles.length === 0}
                        >
                            {uploading ? 'Upload en cours...' : 'Uploader les photos'}
                        </button>
                    </form>

                    {/* 🆕 RÉSULTATS DÉTAILLÉS */}
                    {uploadResults && (
                        <div className="upload-results">
                            <div className={`results-summary ${uploadResults.failed.length === 0 ? 'success' : 'partial'}`}>
                                <h3>
                                    {uploadResults.failed.length === 0 ? '✅ ' : '⚠️ '}
                                    {uploadResults.message}
                                </h3>
                            </div>

                            {uploadResults.success.length > 0 && (
                                <div className="results-section success-section">
                                    <h4>✅ Photos uploadées avec succès ({uploadResults.success.length})</h4>
                                    <ul className="results-list">
                                        {uploadResults.success.map((photo, idx) => (
                                            <li key={idx} className="result-item success">
                                                <span className="icon">✓</span>
                                                <span className="name">{photo.originalName}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {uploadResults.failed.length > 0 && (
                                <div className="results-section error-section">
                                    <h4>❌ Échecs ({uploadResults.failed.length})</h4>
                                    <ul className="results-list">
                                        {uploadResults.failed.map((failure, idx) => (
                                            <li key={idx} className="result-item error">
                                                <span className="icon">✗</span>
                                                <div className="error-details">
                                                    <span className="name">{failure.filename}</span>
                                                    <span className="error-message">
                                                        Erreur : {failure.error}
                                                    </span>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
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