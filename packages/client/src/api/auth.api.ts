import type { LoginRequest, RegisterRequest, AuthResponse, User } from '@/types/user.types';

// Заглушка для имитации задержки и ответа
const fakeUser: User = {
    id: '1',
    email: 'test@example.com',
    role: 'admin'
};

export const AuthApi = {
    async login(credentials: LoginRequest): Promise<AuthResponse> {
        console.log('API login called with', credentials);
        // Имитация успешного входа
        return {
            accessToken: 'fake-access-token',
            refreshToken: 'fake-refresh-token',
            user: fakeUser
        };
    },

    async register(data: RegisterRequest): Promise<AuthResponse> {
        console.log('API register called with', data);
        return {
            accessToken: 'fake-access-token',
            refreshToken: 'fake-refresh-token',
            user: { ...fakeUser, email: data.email }
        };
    },

    async logout(): Promise<void> {
        console.log('API logout called');
        // ничего не делаем
    },

    async refreshToken(token: string): Promise<AuthResponse> {
        console.log('API refreshToken called with', token);
        return {
            accessToken: 'new-fake-access-token',
            refreshToken: 'new-fake-refresh-token',
            user: fakeUser
        };
    },

    async updateProfile(data: Partial<User>): Promise<User> {
        console.log('API updateProfile called with', data);
        return { ...fakeUser, ...data };
    }
};