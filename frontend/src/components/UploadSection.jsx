import { useState } from 'react';
import axios from 'axios';

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

            <style>{`
                .selected-files {
                    margin: 1rem 0;
                    padding: 1rem;
                    background: #f8f9fa;
                    border-radius: 4px;
                }

                .selected-files h3 {
                    font-size: 0.9rem;
                    margin-bottom: 0.75rem;
                    color: #666;
                }

                .file-list {
                    list-style: none;
                    padding: 0;
                    margin: 0;
                }

                .file-item {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    padding: 0.5rem;
                    background: white;
                    border-radius: 4px;
                    margin-bottom: 0.5rem;
                }

                .file-name {
                    flex: 1;
                    font-size: 0.9rem;
                    color: #333;
                }

                .file-size {
                    font-size: 0.85rem;
                    color: #999;
                }

                .btn-remove {
                    background: transparent;
                    border: none;
                    color: #dc3545;
                    cursor: pointer;
                    font-size: 1.2rem;
                    padding: 0.25rem 0.5rem;
                    transition: opacity 0.2s;
                }

                .btn-remove:hover {
                    opacity: 0.7;
                }

                .upload-progress {
                    margin: 1.5rem 0;
                }

                .progress-bar {
                    width: 100%;
                    height: 30px;
                    background: #e9ecef;
                    border-radius: 4px;
                    overflow: hidden;
                }

                .progress-fill {
                    height: 100%;
                    background: linear-gradient(90deg, #C9A86A 0%, #E5D4B8 100%);
                    transition: width 0.3s ease;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .progress-text {
                    text-align: center;
                    margin-top: 0.5rem;
                    font-size: 0.9rem;
                    color: #666;
                }

                .upload-results {
                    margin-top: 2rem;
                    padding: 1.5rem;
                    background: #f8f9fa;
                    border-radius: 4px;
                }

                .results-summary {
                    padding: 1rem;
                    border-radius: 4px;
                    margin-bottom: 1rem;
                }

                .results-summary.success {
                    background: rgba(40, 167, 69, 0.1);
                    border-left: 3px solid #28a745;
                }

                .results-summary.partial {
                    background: rgba(255, 193, 7, 0.1);
                    border-left: 3px solid #ffc107;
                }

                .results-summary h3 {
                    margin: 0;
                    font-size: 1.1rem;
                    color: #333;
                }

                .results-section {
                    margin-top: 1rem;
                    padding: 1rem;
                    background: white;
                    border-radius: 4px;
                }

                .results-section h4 {
                    margin: 0 0 1rem 0;
                    font-size: 1rem;
                    font-weight: 500;
                }

                .results-list {
                    list-style: none;
                    padding: 0;
                    margin: 0;
                }

                .result-item {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    padding: 0.5rem;
                    margin-bottom: 0.5rem;
                    border-radius: 4px;
                }

                .result-item.success {
                    background: rgba(40, 167, 69, 0.05);
                }

                .result-item.error {
                    background: rgba(220, 53, 69, 0.05);
                }

                .result-item .icon {
                    font-size: 1.2rem;
                    font-weight: bold;
                }

                .result-item.success .icon {
                    color: #28a745;
                }

                .result-item.error .icon {
                    color: #dc3545;
                }

                .result-item .name {
                    font-size: 0.9rem;
                    color: #333;
                }

                .error-details {
                    display: flex;
                    flex-direction: column;
                    gap: 0.25rem;
                }

                .error-message {
                    font-size: 0.85rem;
                    color: #dc3545;
                    font-style: italic;
                }
            `}</style>
        </section>
    );
}

export default UploadSection;