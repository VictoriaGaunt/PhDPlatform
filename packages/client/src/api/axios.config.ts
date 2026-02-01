import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { useAuthStore } from '@/stores/auth.store';
import { router } from '@/router';

class ApiClient {
    private instance: AxiosInstance;
    private baseURL: string;

    constructor() {
        this.baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

        this.instance = axios.create({
            baseURL: this.baseURL,
            timeout: 30000, // 30 секунд
            headers: {
                'Content-Type': 'application/json',
            },
        });

        this.setupInterceptors();
    }

    private setupInterceptors(): void {
        // Request interceptor
        this.instance.interceptors.request.use(
            (config: AxiosRequestConfig) => {
                const authStore = useAuthStore();

                if (authStore.isAuthenticated && authStore.accessToken) {
                    config.headers = {
                        ...config.headers,
                        Authorization: `Bearer ${authStore.accessToken}`,
                    };
                }

                return config;
            },
            (error) => {
                return Promise.reject(error);
            }
        );

        // Response interceptor
        this.instance.interceptors.response.use(
            (response: AxiosResponse) => response,
            async (error) => {
                const originalRequest = error.config;

                // Если ошибка 401 и это не запрос на обновление токена
                if (error.response?.status === 401 && !originalRequest._retry) {
                    originalRequest._retry = true;

                    try {
                        const authStore = useAuthStore();
                        await authStore.refreshToken();

                        // Повторяем оригинальный запрос с новым токеном
                        originalRequest.headers.Authorization = `Bearer ${authStore.accessToken}`;
                        return this.instance(originalRequest);
                    } catch (refreshError) {
                        // Если обновление токена не удалось, выходим
                        authStore.logout();
                        router.push('/login');
                        return Promise.reject(refreshError);
                    }
                }

                // Обработка других ошибок
                if (error.response?.status === 403) {
                    router.push('/forbidden');
                }

                return Promise.reject(error);
            }
        );
    }

    public get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
        return this.instance.get(url, config).then(response => response.data);
    }

    public post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
        return this.instance.post(url, data, config).then(response => response.data);
    }

    public put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
        return this.instance.put(url, data, config).then(response => response.data);
    }

    public patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
        return this.instance.patch(url, data, config).then(response => response.data);
    }

    public delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
        return this.instance.delete(url, config).then(response => response.data);
    }

    public download(url: string, filename: string): void {
        const link = document.createElement('a');
        link.href = `${this.baseURL}${url}`;
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

export const apiClient = new ApiClient();