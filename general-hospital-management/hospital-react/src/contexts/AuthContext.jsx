import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../api/authApi';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    // Kiểm tra token khi app load
    useEffect(() => {
        const storedToken = localStorage.getItem('jwt_token');
        const storedUser = localStorage.getItem('current_user');

        if (storedToken && storedUser) {
            try {
                setToken(storedToken);
                setUser(JSON.parse(storedUser));
            } catch (e) {
                console.error('Failed to parse stored user:', e);
                localStorage.removeItem('jwt_token');
                localStorage.removeItem('current_user');
            }
        }
        setLoading(false);
    }, []);

    const login = useCallback(async (tenDangNhap, matKhau) => {
        try {
            const response = await authApi.login(tenDangNhap, matKhau);

            // Extract token and user from response
            const { token: newToken, ...userData } = response;

            // Store in localStorage
            localStorage.setItem('jwt_token', newToken);
            localStorage.setItem('current_user', JSON.stringify(userData));

            setToken(newToken);
            setUser(userData);

            return { success: true, user: userData };
        } catch (error) {
            console.error('Login failed:', error);
            return {
                success: false,
                error: error.response?.data?.message || 'Đăng nhập thất bại'
            };
        }
    }, []);

    const register = useCallback(async (userData) => {
        try {
            const response = await authApi.register(userData);
            return { success: true, data: response };
        } catch (error) {
            console.error('Registration failed:', error);
            return {
                success: false,
                error: error.response?.data?.message || 'Đăng ký thất bại'
            };
        }
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem('jwt_token');
        localStorage.removeItem('current_user');
        setToken(null);
        setUser(null);
    }, []);

    const isAuthenticated = Boolean(token && user);

    const value = {
        user,
        token,
        loading,
        isAuthenticated,
        login,
        register,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

export default AuthContext;
