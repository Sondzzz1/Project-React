import { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react';
import { authApi, AuthUser } from '../services/auth.services';
import { APP_CONFIG } from '../constant/config';

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface AuthContextType {
    user: Omit<AuthUser, 'token'> | null;
    token: string | null;
    loading: boolean;
    isAuthenticated: boolean;
    login: (tenDangNhap: string, matKhau: string) => Promise<{ success: boolean; user?: Omit<AuthUser, 'token'>; error?: string }>;
    register: (userData: object) => Promise<{ success: boolean; data?: AuthUser; error?: string }>;
    logout: () => void;
}

// ─── Context ────────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<Omit<AuthUser, 'token'> | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    // Kiểm tra token khi app load
    useEffect(() => {
        const storedToken = localStorage.getItem(APP_CONFIG.TOKEN_KEY);
        const storedUser = localStorage.getItem(APP_CONFIG.USER_KEY);

        if (storedToken && storedUser) {
            try {
                setToken(storedToken);
                setUser(JSON.parse(storedUser));
            } catch (e) {
                console.error('Failed to parse stored user:', e);
                localStorage.removeItem(APP_CONFIG.TOKEN_KEY);
                localStorage.removeItem(APP_CONFIG.USER_KEY);
            }
        }
        setLoading(false);
    }, []);

    const login = useCallback(async (tenDangNhap: string, matKhau: string) => {
        try {
            const response = await authApi.login(tenDangNhap, matKhau);
            const { token: newToken, ...userData } = response;

            localStorage.setItem(APP_CONFIG.TOKEN_KEY, newToken);
            localStorage.setItem(APP_CONFIG.USER_KEY, JSON.stringify(userData));

            setToken(newToken);
            setUser(userData);

            return { success: true, user: userData };
        } catch (error: unknown) {
            console.error('Login failed:', error);
            const axiosErr = error as { response?: { data?: { message?: string } } };
            return {
                success: false,
                error: axiosErr.response?.data?.message || 'Đăng nhập thất bại',
            };
        }
    }, []);

    const register = useCallback(async (userData: object) => {
        try {
            const response = await authApi.register(userData as Parameters<typeof authApi.register>[0]);
            return { success: true, data: response };
        } catch (error: unknown) {
            console.error('Registration failed:', error);
            const axiosErr = error as { response?: { data?: { message?: string } } };
            return {
                success: false,
                error: axiosErr.response?.data?.message || 'Đăng ký thất bại',
            };
        }
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem(APP_CONFIG.TOKEN_KEY);
        localStorage.removeItem(APP_CONFIG.USER_KEY);
        setToken(null);
        setUser(null);
    }, []);

    const isAuthenticated = Boolean(token && user);

    // ✅ useMemo prevents unnecessary re-renders of all consumers
    const value = useMemo<AuthContextType>(
        () => ({ user, token, loading, isAuthenticated, login, register, logout }),
        [user, token, loading, isAuthenticated, login, register, logout]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

export default AuthContext;
