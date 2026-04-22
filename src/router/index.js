import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/LoginView.vue'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'login',
            component: LoginView
        },
        {
            path: '/dashboard',
            name: 'dashboard',
            component: () => import('../views/DashboardView.vue')
        },
        {
            path: '/meal-input',
            name: 'meal-input',
            component: () => import('../views/MealInputView.vue')
        },
        {
            path: '/meal-view',
            name: 'meal-view',
            component: () => import('../views/MealView.vue')
        }
    ]
})

export default router