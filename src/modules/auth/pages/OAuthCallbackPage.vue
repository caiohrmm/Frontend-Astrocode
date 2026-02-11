<template>
  <v-container class="fill-height">
    <v-row align="center" justify="center" class="fill-height">
      <v-col cols="12" sm="8" md="6" lg="4">
        <v-card>
          <v-card-text class="text-center">
            <v-progress-circular
              indeterminate
              color="primary"
              size="64"
              class="mb-4"
            ></v-progress-circular>
            <p class="text-h6">Autenticando com Google...</p>
            <p class="text-body-2 text-medium-emphasis mt-2">
              Por favor, aguarde
            </p>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/app/store/auth.store'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

onMounted(async () => {
  // Check for error in query params (from backend redirect)
  const error = route.query.error as string | undefined
  if (error) {
    authStore.error = decodeURIComponent(error)
    router.push({ name: 'login' })
    return
  }

  // Check for token in URL fragment (from backend redirect)
  const hash = window.location.hash
  const tokenMatch = hash.match(/token=([^&]+)/)
  
  if (tokenMatch && tokenMatch[1]) {
    const token = tokenMatch[1]
    
    try {
      // Set token in store (this will also set it in API client)
      authStore.setToken(token)
      
      // Fetch user information
      await authStore.fetchCurrentUser()
      
      // Clear URL hash for security
      window.history.replaceState(null, '', window.location.pathname)
      
      // Redirect based on user role
      const userRoles = authStore.userRoles
      if (userRoles.includes('gestor')) {
        router.push({ name: 'dashboard' })
      } else {
        router.push({ name: 'clients' })
      }
    } catch (error) {
      authStore.error = error instanceof Error ? error.message : 'Falha ao obter informações do usuário'
      router.push({ name: 'login' })
    }
  } else {
    // No token found, redirect to login
    authStore.error = 'Token de autenticação não encontrado'
    router.push({ name: 'login' })
  }
})
</script>

<style scoped>
.fill-height {
  min-height: 100vh;
}
</style>


