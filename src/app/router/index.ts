import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/app/store/auth.store'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'login',
    component: () => import('@/modules/auth/pages/LoginPage.vue'),
    meta: {
      layout: 'auth',
      requiresAuth: false, // Public route
    },
  },
  {
    path: '/auth/google/callback',
    name: 'oauth-callback',
    component: () => import('@/modules/auth/pages/OAuthCallbackPage.vue'),
    meta: {
      layout: 'auth',
      requiresAuth: false, // Public route (handles OAuth callback)
    },
  },
  {
    path: '/',
    name: 'dashboard',
    component: () => import('@/modules/dashboard/pages/DashboardPage.vue'),
    meta: {
      layout: 'app',
      requiresAuth: true, // Protected route
    },
  },
  {
    path: '/users',
    name: 'users',
    component: () => import('@/modules/users/pages/UsersPage.vue'),
    meta: {
      layout: 'app',
      requiresAuth: true,
      requiresManager: true, // Only managers can access
    },
  },
  {
    path: '/properties',
    name: 'properties',
    component: () => import('@/modules/properties/pages/PropertiesListPage.vue'),
    meta: {
      layout: 'app',
      requiresAuth: true,
    },
  },
  {
    path: '/properties/create',
    name: 'properties-create',
    component: () => import('@/modules/properties/pages/PropertyFormPage.vue'),
    meta: {
      layout: 'app',
      requiresAuth: true,
    },
  },
  {
    path: '/properties/:id/edit',
    name: 'properties-edit',
    component: () => import('@/modules/properties/pages/PropertyFormPage.vue'),
    meta: {
      layout: 'app',
      requiresAuth: true,
    },
  },
  {
    path: '/properties/:id',
    name: 'properties-details',
    component: () => import('@/modules/properties/pages/PropertyDetailsPage.vue'),
    meta: {
      layout: 'app',
      requiresAuth: true,
    },
  },
  {
    path: '/clients',
    name: 'clients',
    component: () => import('@/modules/clients/pages/ClientsListPage.vue'),
    meta: {
      layout: 'app',
      requiresAuth: true,
    },
  },
  {
    path: '/clients/:id',
    name: 'clients-details',
    component: () => import('@/modules/clients/pages/ClientDetailsPage.vue'),
    meta: {
      layout: 'app',
      requiresAuth: true,
    },
  },
  {
    path: '/attendances',
    name: 'attendances',
    component: () => import('@/modules/attendances/pages/AttendanceListPage.vue'),
    meta: {
      layout: 'app',
      requiresAuth: true,
    },
  },
  {
    path: '/attendances/:id',
    name: 'attendances-details',
    component: () => import('@/modules/attendances/pages/AttendanceDetailsPage.vue'),
    meta: {
      layout: 'app',
      requiresAuth: true,
    },
  },
  {
    path: '/attendances/create',
    name: 'attendances-create',
    component: () => import('@/modules/attendances/pages/AttendanceCreatePage.vue'),
    meta: {
      layout: 'app',
      requiresAuth: true,
    },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// Navigation guard to protect routes
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  
  // Check if route requires authentication (default is true if not specified)
  const requiresAuth = to.meta.requiresAuth !== false
  
  // If route requires auth, check authentication
  if (requiresAuth) {
    // Check if token exists in store or localStorage
    const storedToken = authStore.token || authStore.getToken() || localStorage.getItem('auth_token')
    
    if (!storedToken) {
      // No token, redirect to login
      next({ name: 'login' })
      return
    }
    
    // If token exists but user is not loaded, try to fetch user
    if (!authStore.user && storedToken) {
      try {
        // Set token in store if it exists in localStorage but not in store
        if (!authStore.token && storedToken) {
          authStore.setToken(storedToken)
        }
        // Fetch user info to validate token
        await authStore.fetchCurrentUser()
      } catch (error) {
        // Token is invalid or expired, clear and redirect to login
        await authStore.logout()
        next({ name: 'login' })
        return
      }
    }
    
    // Final verification: user must be authenticated
    if (!authStore.isAuthenticated) {
      next({ name: 'login' })
      return
    }

    // Check if route requires manager role
    if (to.meta.requiresManager) {
      const userRoles = authStore.userRoles
      if (!userRoles.includes('gestor')) {
        // User doesn't have manager role, redirect to dashboard
        next({ name: 'dashboard' })
        return
      }
    }
  }
  
  // If user is authenticated and trying to access login, redirect to dashboard
  if (to.name === 'login' && authStore.isAuthenticated) {
    next({ name: 'dashboard' })
    return
  }
  
  // Allow navigation
  next()
})

export default router
