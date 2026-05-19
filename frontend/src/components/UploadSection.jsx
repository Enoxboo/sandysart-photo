import { useState } from 'react';
import axios from 'axios';
import './UploadSection.css';

function UploadSection({ onUploadComplete }) {
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [tags, setTags] = useState('');
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [results, setResults] = useState(null);

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        setSelectedFiles(files);
        setResults(null);
    };

    const handleUpload = async (e) => {
        e.preventDefault();

        if (selectedFiles.length === 0) {
            alert('Veuillez sélectionner au moins une photo');
            return;
        }

        setUploading(true);
        setProgress(0);
        setResults(null);

        const formData = new FormData();
        selectedFiles.forEach(file => {
            formData.append('photos', file);
        });
        if (tags.trim()) {
            formData.append('tags', tags);
        }

        try {
            const token = localStorage.getItem('token');
            const response = await axios.post('/api/photos/upload-multiple', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`
                },
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round(
                        (progressEvent.loaded * 100) / progressEvent.total
                    );
                    setProgress(percentCompleted);
                }
            });

            setResults(response.data);
            setSelectedFiles([]);
            setTags('');
            document.getElementById('photo-input').value = '';

            if (onUploadComplete) {
                onUploadComplete();
            }

        } catch (error) {
            console.error('Erreur upload:', error);
            setResults({
                message: 'Erreur lors de l\'upload',
                total: selectedFiles.length,
                success: [],
                failed: selectedFiles.map(f => ({
                    filename: f.name,
                    error: error.response?.data?.error || error.message || 'Erreur inconnue'
                }))
            });
        } finally {
            setUploading(false);
            setProgress(0);
        }
    };

    const removeFile = (index) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    };

    return (
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
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                        <p className="progress-text">Upload en cours... {progress}%</p>
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

            {/* Résultats détaillés */}
            {results && (
                <div className="upload-results">
                    <div className={`results-summary ${results.failed.length === 0 ? 'success' : 'partial'}`}>
                        <h3>
                            {results.failed.length === 0 ? '✅ ' : '⚠️ '}
                            {results.message}
                        </h3>
                    </div>

                    {results.success.length > 0 && (
                        <div className="results-section success-section">
                            <h4>✅ Photos uploadées avec succès ({results.success.length})</h4>
                            <ul className="results-list">
                                {results.success.map((photo, idx) => (
                                    <li key={idx} className="result-item success">
                                        <span className="icon">✓</span>
                                        <span className="name">{photo.originalName}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {results.failed.length > 0 && (
                        <div className="results-section error-section">
                            <h4>❌ Échecs ({results.failed.length})</h4>
                            <ul className="results-list">
                                {results.failed.map((failure, idx) => (
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
    );
}

export default UploadSection;