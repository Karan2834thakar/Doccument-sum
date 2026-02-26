const API_BASE_URL = 'https://doccument-sum.onrender.com/api';

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

    // Check if response is actually JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Non-JSON response received:', text);
        throw new Error(`Server returned HTML/Text instead of JSON. Check your backend server.`);
    }

    const data = await response.json();

    if (!response.ok) {
        const errorMsg = data.error || data.message || 'Something went wrong';
        throw new Error(errorMsg);
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

    forgotPassword: (email) =>
        apiCall('/auth/forgot-password', {
            method: 'POST',
            body: JSON.stringify({ email }),
        }),

    resetPassword: (token, password) =>
        apiCall(`/auth/reset-password/${token}`, {
            method: 'POST',
            body: JSON.stringify({ password }),
        }),
};

// Summary API
export const summaryAPI = {
    save: (fileName, fileType, summary, keyPoints, fullText) =>
        apiCall('/summaries', {
            method: 'POST',
            body: JSON.stringify({ fileName, fileType, summary, keyPoints, fullText }),
        }),

    getAll: () => apiCall('/summaries'),

    delete: (id) =>
        apiCall(`/summaries/${id}`, {
            method: 'DELETE',
        }),

    download: (id) => `${API_BASE_URL}/summaries/${id}/download?token=${localStorage.getItem('token')}`,

    chat: (id, message) =>
        apiCall(`/summaries/${id}/chat`, {
            method: 'POST',
            body: JSON.stringify({ message }),
        }),
};
