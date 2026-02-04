import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'login',
    component: () => import('@/modules/auth/pages/LoginPage.vue'),
    meta: {
      layout: 'auth',
    },
  },
  {
    path: '/',
    name: 'dashboard',
    component: () => import('@/modules/dashboard/pages/DashboardPage.vue'),
    meta: {
      layout: 'app',
    },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router


