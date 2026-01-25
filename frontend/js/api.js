/**
 * API Handler cho Bus Route Finder
 * Quản lý tất cả API calls đến backend
 */

const API_BASE_URL = 'http://localhost:5000/api';

// Helper: Lấy token từ localStorage
const getToken = () => localStorage.getItem('token');

// Helper: Lấy user info từ localStorage
const getUser = () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
};

// Helper: Lưu auth data
const saveAuthData = (token, user) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
};

// Helper: Xóa auth data
const clearAuthData = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
};

// Helper: Kiểm tra đã login chưa
const isLoggedIn = () => !!getToken();

// Helper: Redirect nếu chưa login
const requireAuth = () => {
    if (!isLoggedIn()) {
        window.location.href = 'login.html';
        return false;
    }
    return true;
};

// Helper: Hiển thị thông báo
const showAlert = (message, type = 'info') => {
    // Tạo alert element
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
    alertDiv.role = 'alert';
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    // Thêm vào container (tìm container hoặc tạo mới)
    let container = document.querySelector('.alert-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'alert-container position-fixed top-0 end-0 p-3';
        container.style.zIndex = '9999';
        document.body.appendChild(container);
    }
    
    container.appendChild(alertDiv);
    
    // Auto remove sau 5s
    setTimeout(() => {
        alertDiv.remove();
    }, 5000);
};

// Helper: Loading spinner
const showLoading = (element) => {
    if (element) {
        element.disabled = true;
        element.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Đang xử lý...';
    }
};

const hideLoading = (element, originalText) => {
    if (element) {
        element.disabled = false;
        element.innerHTML = originalText;
    }
};

/**
 * API Functions
 */

// AUTH APIs
const authAPI = {
    // Đăng ký
    register: async (data) => {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            
            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.message || 'Đăng ký thất bại');
            }
            
            // Lưu token và user info
            saveAuthData(result.token, result.user);
            
            return result;
        } catch (error) {
            throw error;
        }
    },
    
    // Đăng nhập
    login: async (data) => {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            
            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.message || 'Đăng nhập thất bại');
            }
            
            // Lưu token và user info
            saveAuthData(result.token, result.user);
            
            return result;
        } catch (error) {
            throw error;
        }
    },
    
    // Đăng xuất
    logout: () => {
        clearAuthData();
        window.location.href = 'index.html';
    },
    
    // Lấy thông tin user hiện tại
    getMe: async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/me`, {
                headers: {
                    'Authorization': `Bearer ${getToken()}`
                }
            });
            
            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.message || 'Lấy thông tin thất bại');
            }
            
            // Cập nhật user info trong localStorage
            localStorage.setItem('user', JSON.stringify(result.user));
            
            return result;
        } catch (error) {
            throw error;
        }
    },
    
    // Cập nhật profile
    updateProfile: async (data) => {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getToken()}`
                },
                body: JSON.stringify(data)
            });
            
            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.message || 'Cập nhật thất bại');
            }
            
            // Cập nhật user info
            localStorage.setItem('user', JSON.stringify(result.user));
            
            return result;
        } catch (error) {
            throw error;
        }
    },
    
    // Nạp tiền
    topup: async (amount) => {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/topup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getToken()}`
                },
                body: JSON.stringify({ amount })
            });
            
            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.message || 'Nạp tiền thất bại');
            }
            
            return result;
        } catch (error) {
            throw error;
        }
    }
};

// ROUTE APIs
const routeAPI = {
    // Lấy tất cả tuyến
    getAllRoutes: async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/routes`);
            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.message || 'Lấy danh sách tuyến thất bại');
            }
            
            return result;
        } catch (error) {
            throw error;
        }
    },
    
    // Lấy chi tiết 1 tuyến
    getRoute: async (id) => {
        try {
            const response = await fetch(`${API_BASE_URL}/routes/${id}`);
            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.message || 'Lấy thông tin tuyến thất bại');
            }
            
            return result;
        } catch (error) {
            throw error;
        }
    },
    
    // Tìm tuyến
    searchRoutes: async (from, to) => {
        try {
            const response = await fetch(`${API_BASE_URL}/routes/search`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ from, to })
            });
            
            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.message || 'Tìm kiếm thất bại');
            }
            
            return result;
        } catch (error) {
            throw error;
        }
    },
    
    // Thêm yêu thích
    addFavorite: async (routeId) => {
        try {
            const response = await fetch(`${API_BASE_URL}/routes/${routeId}/favorite`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${getToken()}`
                }
            });
            
            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.message || 'Thêm yêu thích thất bại');
            }
            
            return result;
        } catch (error) {
            throw error;
        }
    },
    
    // Xóa yêu thích
    removeFavorite: async (routeId) => {
        try {
            const response = await fetch(`${API_BASE_URL}/routes/${routeId}/favorite`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${getToken()}`
                }
            });
            
            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.message || 'Xóa yêu thích thất bại');
            }
            
            return result;
        } catch (error) {
            throw error;
        }
    }
};

// TICKET APIs
const ticketAPI = {
    // Mua vé
    purchase: async (data) => {
        try {
            const response = await fetch(`${API_BASE_URL}/tickets/purchase`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getToken()}`
                },
                body: JSON.stringify(data)
            });
            
            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.message || 'Mua vé thất bại');
            }
            
            return result;
        } catch (error) {
            throw error;
        }
    },
    
    // Lấy danh sách vé
    getMyTickets: async (status = null) => {
        try {
            let url = `${API_BASE_URL}/tickets/my-tickets`;
            if (status) {
                url += `?status=${status}`;
            }
            
            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${getToken()}`
                }
            });
            
            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.message || 'Lấy danh sách vé thất bại');
            }
            
            return result;
        } catch (error) {
            throw error;
        }
    },
    
    // Lấy chi tiết vé
    getTicket: async (id) => {
        try {
            const response = await fetch(`${API_BASE_URL}/tickets/${id}`, {
                headers: {
                    'Authorization': `Bearer ${getToken()}`
                }
            });
            
            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.message || 'Lấy thông tin vé thất bại');
            }
            
            return result;
        } catch (error) {
            throw error;
        }
    },
    
    // Sử dụng vé
    useTicket: async (id) => {
        try {
            const response = await fetch(`${API_BASE_URL}/tickets/${id}/use`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${getToken()}`
                }
            });
            
            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.message || 'Sử dụng vé thất bại');
            }
            
            return result;
        } catch (error) {
            throw error;
        }
    },
    
    // Hủy vé
    cancelTicket: async (id) => {
        try {
            const response = await fetch(`${API_BASE_URL}/tickets/${id}/cancel`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${getToken()}`
                }
            });
            
            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.message || 'Hủy vé thất bại');
            }
            
            return result;
        } catch (error) {
            throw error;
        }
    }
};

// Format tiền VNĐ
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(amount);
};

// Format ngày giờ
const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('vi-VN');
};

// Format ngày
const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
};
