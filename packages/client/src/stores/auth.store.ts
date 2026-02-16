// packages/client/src/stores/auth.store.ts

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { AuthApi } from '@/api/auth.api';
import type { User, LoginRequest, RegisterRequest, AuthResponse } from '@/types/user.types';
import { useRouter } from 'vue-router';

export const useAuthStore = defineStore('auth', () => {
    const router = useRouter();

    // State
    const user = ref<User | null>(null);
    const accessToken = ref<string | null>(localStorage.getItem('access_token'));
    const refreshToken = ref<string | null>(localStorage.getItem('refresh_token'));
    const isLoading = ref<boolean>(false);
    const error = ref<string | null>(null);

    // Getters
    const isAuthenticated = computed(() => !!accessToken.value && !!user.value);
    const isAdmin = computed(() => user.value?.role === 'admin');
    const isGuest = computed(() => user.value?.role === 'guest' || !user.value);

    // Actions
    const setAuthData = (data: AuthResponse) => {
        accessToken.value = data.accessToken;
        refreshToken.value = data.refreshToken;
        user.value = data.user;

        localStorage.setItem('access_token', data.accessToken);
        localStorage.setItem('refresh_token', data.refreshToken);
        localStorage.setItem('user', JSON.stringify(data.user));
    };

    const clearAuthData = () => {
        accessToken.value = null;
        refreshToken.value = null;
        user.value = null;

        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
    };

    const loadUserFromStorage = () => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                user.value = JSON.parse(storedUser);
            } catch (e) {
                clearAuthData();
            }
        }
    };

    const login = async (credentials: LoginRequest) => {
        isLoading.value = true;
        error.value = null;
        try {
            const response = await AuthApi.login(credentials);
            setAuthData(response);
            await router.push('/dashboard');
            return response;
        } catch (err: any) {
            error.value = err.response?.data?.message || 'Login failed';
            throw err;
        } finally {
            isLoading.value = false;
        }
    };

    const register = async (userData: RegisterRequest) => {
        isLoading.value = true;
        error.value = null;
        try {
            const response = await AuthApi.register(userData);
            setAuthData(response);
            await router.push('/dashboard');
            return response;
        } catch (err: any) {
            error.value = err.response?.data?.message || 'Registration failed';
            throw err;
        } finally {
            isLoading.value = false;
        }
    };

    const logout = async () => {
        isLoading.value = true;
        try {
            if (accessToken.value) {
                await AuthApi.logout();
            }
        } catch (err) {
            console.error('Logout error:', err);
        } finally {
            clearAuthData();
            await router.push('/login');
            isLoading.value = false;
        }
    };

    // Переименовано, чтобы избежать конфликта с refreshToken (ref)
    const refreshAccessToken = async () => {
        if (!refreshToken.value) {
            throw new Error('No refresh token available');
        }
        try {
            const response = await AuthApi.refreshToken(refreshToken.value);
            setAuthData(response);
            return response;
        } catch (err) {
            clearAuthData();
            throw err;
        }
    };

    const updateProfile = async (userData: Partial<User>) => {
        try {
            const response = await AuthApi.updateProfile(userData);
            user.value = { ...user.value, ...response };
            localStorage.setItem('user', JSON.stringify(user.value));
            return response;
        } catch (err: any) {
            error.value = err.response?.data?.message || 'Profile update failed';
            throw err;
        }
    };

    // Инициализация
    loadUserFromStorage();

    return {
        // State
        user,
        accessToken,
        refreshToken,
        isLoading,
        error,

        // Getters
        isAuthenticated,
        isAdmin,
        isGuest,

        // Actions
        login,
        register,
        logout,
        refreshAccessToken,   // обратите внимание – новое имя
        updateProfile,
        clearAuthData
    };
});