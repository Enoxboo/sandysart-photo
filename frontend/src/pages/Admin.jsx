import {useState, useEffect, useCallback} from 'react';
import {login, verifyToken, getAllPhotos, uploadPhoto, updatePhoto, deletePhoto} from '../services/api';
import './Admin.css';

function Admin() {
    // États pour l'authentification
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);
    const [loginForm, setLoginForm] = useState({username: '', password: ''});
    const [loginError, setLoginError] = useState('');

    // États pour la gestion des photos
    const [photos, setPhotos] = useState([]);
    const [uploadForm, setUploadForm] = useState({
        photo: null,
        title: '',
        description: '',
        tags: ''
    });
    const [uploadMessage, setUploadMessage] = useState('');

    // Vérifier si l'utilisateur est déjà connecté au chargement
    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    // Charger les photos si authentifié
    useEffect(() => {
        if (isAuthenticated) {
            loadPhotos();
        }
    }, [isAuthenticated, loadPhotos]);

    // Vérifier le token dans le localStorage
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

    // Gérer le login
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

    // Gérer le logout
    const handleLogout = () => {
        localStorage.removeItem('token');
        setIsAuthenticated(false);
    };

    // Charger toutes les photos
    const loadPhotos = useCallback(async () => {
        try {
            const data = await getAllPhotos();
            setPhotos(data);
        } catch (error) {
            console.error('Erreur lors du chargement des photos:', error);
        }
    }, []);

    // Gérer l'upload d'une photo
    const handleUpload = async (e) => {
        e.preventDefault();
        setUploadMessage('');

        if (!uploadForm.photo) {
            setUploadMessage('Veuillez sélectionner une photo');
            return;
        }

        const formData = new FormData();
        formData.append('photo', uploadForm.photo);
        formData.append('title', uploadForm.title);
        formData.append('description', uploadForm.description);
        formData.append('tags', uploadForm.tags);

        try {
            await uploadPhoto(formData);
            setUploadMessage('Photo uploadée avec succès ! ✅');
            setUploadForm({photo: null, title: '', description: '', tags: ''});
            // Reset le input file
            document.getElementById('photo-input').value = '';
            // Recharger les photos
            loadPhotos();
        } catch (error) {
            setUploadMessage('Erreur lors de l\'upload ❌');
            console.error(error);
        }
    };

    // Marquer/démarquer comme photo de la semaine
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

    // Supprimer une photo
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

    // Affichage pendant le chargement
    if (loading) {
        return (
            <div className="container">
                <p>Vérification de l'authentification...</p>
            </div>
        );
    }

    // Si pas authentifié, afficher le formulaire de login
    if (!isAuthenticated) {
        return (
            <div className="container">
                <div className="login-container">
                    <h1>Administration</h1>
                    <form onSubmit={handleLogin} className="login-form">
                        <div className="form-group">
                            <label htmlFor="username">Nom d'utilisateur</label>
                            <input
                                type="text"
                                id="username"
                                value={loginForm.username}
                                onChange={(e) => setLoginForm({...loginForm, username: e.target.value})}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="password">Mot de passe</label>
                            <input
                                type="password"
                                id="password"
                                value={loginForm.password}
                                onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                                required
                            />
                        </div>

                        {loginError && <p className="error">{loginError}</p>}

                        <button type="submit" className="btn-primary">Se connecter</button>
                    </form>
                </div>
            </div>
        );
    }

    // Si authentifié, afficher le dashboard admin
    return (
        <div className="container">
            <div className="admin-header">
                <h1>Dashboard Admin</h1>
                <button onClick={handleLogout} className="btn-secondary">Déconnexion</button>
            </div>

            {/* Section upload */}
            <section className="upload-section">
                <h2>📤 Uploader une nouvelle photo</h2>
                <form onSubmit={handleUpload} className="upload-form">
                    <div className="form-group">
                        <label htmlFor="photo-input">Photo *</label>
                        <input
                            type="file"
                            id="photo-input"
                            accept="image/*"
                            onChange={(e) => setUploadForm({...uploadForm, photo: e.target.files[0]})}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="title">Titre</label>
                        <input
                            type="text"
                            id="title"
                            value={uploadForm.title}
                            onChange={(e) => setUploadForm({...uploadForm, title: e.target.value})}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="description">Description</label>
                        <textarea
                            id="description"
                            value={uploadForm.description}
                            onChange={(e) => setUploadForm({...uploadForm, description: e.target.value})}
                            rows="3"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="tags">Tags (séparés par des virgules)</label>
                        <input
                            type="text"
                            id="tags"
                            placeholder="grossesse, famille, bébé"
                            value={uploadForm.tags}
                            onChange={(e) => setUploadForm({...uploadForm, tags: e.target.value})}
                        />
                    </div>

                    <button type="submit" className="btn-primary">Uploader</button>
                </form>

                {uploadMessage && <p className={uploadMessage.includes('✅') ? 'success' : 'error'}>{uploadMessage}</p>}
            </section>

            {/* Section liste des photos */}
            <section className="photos-management">
                <h2>📸 Gestion des photos ({photos.length})</h2>

                {photos.length === 0 ? (
                    <p>Aucune photo pour le moment.</p>
                ) : (
                    <div className="photos-list">
                        {photos.map((photo) => (
                            <div key={photo.id} className="photo-item">
                                <img src={`/uploads/${photo.filename}`} alt={photo.title || photo.original_name}/>

                                <div className="photo-info">
                                    <h3>{photo.title || 'Sans titre'}</h3>
                                    <p>{photo.description || 'Pas de description'}</p>
                                    {photo.tags && <p className="tags-info">🏷️ {photo.tags}</p>}
                                    <p className="date">📅 {new Date(photo.upload_date).toLocaleDateString('fr-FR')}</p>
                                </div>

                                <div className="photo-actions">
                                    <button
                                        onClick={() => toggleWeekPhoto(photo)}
                                        className={photo.is_week_photo ? 'btn-success' : 'btn-secondary'}
                                    >
                                        {photo.is_week_photo ? '⭐ Photo de la semaine' : '☆ Marquer comme photo de la semaine'}
                                    </button>

                                    <button
                                        onClick={() => handleDelete(photo.id)}
                                        className="btn-danger"
                                    >
                                        🗑️ Supprimer
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}

export default Admin;