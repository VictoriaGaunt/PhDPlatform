export interface User {
    id: string;
    email: string;
    role: 'admin' | 'guest' | 'user';
    // добавьте другие поля по необходимости
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    email: string;
    password: string;
    name?: string;
}

export interface AuthResponse {
    accessToken: string;
    refreshToken: string;
    user: User;
}