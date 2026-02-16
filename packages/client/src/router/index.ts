import { createRouter, createWebHistory } from 'vue-router'

// Ленивая загрузка компонентов (предполагается, что они существуют)
const routes = [
    {
        path: '/',
        redirect: '/dashboard'
    },
    {
        path: '/login',
        name: 'Login',
        component: () => import('@/views/auth/Login.vue')
    },
    {
        path: '/register',
        name: 'Register',
        component: () => import('@/views/auth/Register.vue')
    },
    {
        path: '/dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/Dashboard.vue'),
        meta: { requiresAuth: true }
    },
    {
        path: '/forbidden',
        name: 'Forbidden',
        component: () => import('@/views/auth/Forbidden.vue')
    }
]

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL), // автоматически подставится base из Vite
    routes
})

// Простейшая проверка аутентификации (можно заменить на вызов store)
router.beforeEach((to, from, next) => {
    const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
    const isAuthenticated = !!localStorage.getItem('access_token')

    if (requiresAuth && !isAuthenticated) {
        next('/login')
    } else {
        next()
    }
})

export default router