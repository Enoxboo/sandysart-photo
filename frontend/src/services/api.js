import axios from 'axios';

/**
 * Axios instance configured with base URL. Auth is handled via an
 * httpOnly cookie set by the backend, sent automatically on every
 * request thanks to withCredentials — no token handling in JS.
 */
const api = axios.create({
    baseURL: '/api',
    withCredentials: true,
});

// ============ AUTH ============

/**
 * Authenticates a user with username and password. On success, the
 * backend sets an httpOnly session cookie — no token is returned.
 * @param {string} username - User's username
 * @param {string} password - User's password
 * @returns {Promise<Object>} Authentication response
 */
export const login = async (username, password) => {
    const response = await api.post('/auth/login', { username, password });
    return response.data;
};

/**
 * Clears the httpOnly session cookie on the backend.
 * @returns {Promise<Object>} Logout confirmation
 */
export const logout = async () => {
    const response = await api.post('/auth/logout');
    return response.data;
};

/**
 * Verifies the validity of the current session cookie.
 * @returns {Promise<Object>} Verification response
 */
export const verifyToken = async () => {
    const response = await api.get('/auth/verify');
    return response.data;
};

// ============ PHOTOS ============

/**
 * Retrieves photos, paginated.
 * @param {Object} [params] - Pagination params
 * @param {number} [params.page] - 1-indexed page number (default 1)
 * @param {number} [params.limit] - Items per page (default 24, max 1000)
 * @returns {Promise<{photos: Array, pagination: {page: number, limit: number, total: number, totalPages: number}}>}
 */
export const getAllPhotos = async (params = {}) => {
    const response = await api.get('/photos', { params });
    return response.data;
};

/**
 * Retrieves a specific photo by ID.
 * @param {string|number} id - Photo ID
 * @returns {Promise<Object>} Photo data
 */
export const getPhotoById = async (id) => {
    const response = await api.get(`/photos/${id}`);
    return response.data;
};

/**
 * Retrieves photos from the current week.
 * @returns {Promise<Array>} List of this week's photos
 */
export const getWeekPhotos = async () => {
    const response = await api.get('/photos/week');
    return response.data;
};

export const getHeroPhotos = async () => {
    const response = await api.get('/photos/hero');
    return response.data;
};

/**
 * Retrieves photos filtered by tag.
 * @param {string} tag - Tag to filter by
 * @returns {Promise<Array>} List of photos with the specified tag
 */
export const getPhotosByTag = async (tag) => {
    const response = await api.get(`/photos/tag/${tag}`);
    return response.data;
};

/**
 * Uploads a new photo.
 * @param {FormData} formData - Form data containing the photo file and metadata
 * @returns {Promise<Object>} Upload response with photo data
 */
export const uploadPhoto = async (formData) => {
    const response = await api.post('/photos', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

/**
 * Updates an existing photo's metadata.
 * @param {string|number} id - Photo ID
 * @param {Object} data - Updated photo data
 * @returns {Promise<Object>} Updated photo data
 */
export const updatePhoto = async (id, data) => {
    const response = await api.put(`/photos/${id}`, data);
    return response.data;
};

/**
 * Deletes a photo by ID.
 * @param {string|number} id - Photo ID
 * @returns {Promise<Object>} Deletion confirmation
 */
export const deletePhoto = async (id) => {
    const response = await api.delete(`/photos/${id}`);
    return response.data;
};

// ============ CONTACT ============

export const sendContactMessage = async (data) => {
    const response = await api.post('/contact', data);
    return response.data;
};

export default api;
