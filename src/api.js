const API_BASE_URL = 'http://localhost:5000/api';

// Helper function to make API calls
const apiCall = async (endpoint, options = {}) => {
    const token = localStorage.getItem('token');

    const config = {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
            ...options.headers,
        },
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || 'Something went wrong');
    }

    return data;
};

// Auth API
export const authAPI = {
    register: (name, email, password) =>
        apiCall('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ name, email, password }),
        }),

    login: (email, password) =>
        apiCall('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        }),
};

// Summary API
export const summaryAPI = {
    save: (fileName, fileType, summary, keyPoints) =>
        apiCall('/summaries', {
            method: 'POST',
            body: JSON.stringify({ fileName, fileType, summary, keyPoints }),
        }),

    getAll: () => apiCall('/summaries'),

    delete: (id) =>
        apiCall(`/summaries/${id}`, {
            method: 'DELETE',
        }),
};
