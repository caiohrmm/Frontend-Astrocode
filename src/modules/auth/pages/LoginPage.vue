<template>
  <v-card>
    <v-card-title class="text-h5 text-center pa-6">
      Login
    </v-card-title>
    <v-card-text>
      <v-alert
        v-if="authStore.error"
        type="error"
        variant="tonal"
        class="mb-4"
        closable
        @click:close="authStore.clearError()"
      >
        {{ authStore.error }}
      </v-alert>

      <v-form @submit.prevent="handleLogin">
        <v-text-field
          v-model="email"
          label="Email"
          type="email"
          prepend-inner-icon="mdi-email"
          variant="outlined"
          class="mb-4"
          :disabled="authStore.isLoading"
          :rules="[rules.required, rules.email]"
        ></v-text-field>
        <v-text-field
          v-model="password"
          label="Senha"
          type="password"
          prepend-inner-icon="mdi-lock"
          variant="outlined"
          class="mb-4"
          :disabled="authStore.isLoading"
          :rules="[rules.required]"
        ></v-text-field>
        <v-btn
          color="primary"
          block
          size="large"
          type="submit"
          :loading="authStore.isLoading"
          :disabled="authStore.isLoading"
        >
          Entrar
        </v-btn>
      </v-form>

      <v-divider class="my-6"></v-divider>

      <v-btn
        color="blue"
        variant="outlined"
        block
        size="large"
        :disabled="authStore.isLoading"
        @click="handleGoogleLogin"
      >
        <v-icon start>mdi-google</v-icon>
        Entrar com Google
      </v-btn>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/app/store/auth.store'
import { authService } from '@/shared/services/auth.service'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')

const rules = {
  required: (value: string) => !!value || 'Campo obrigatório',
  email: (value: string) => {
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return pattern.test(value) || 'Email inválido'
  },
}

const handleLogin = async () => {
  try {
    await authStore.login({
      email: email.value.trim().toLowerCase(),
      password: password.value,
    })
    
    // Redirect to dashboard on success
    router.push({ name: 'dashboard' })
  } catch (error) {
    // Error is already handled by the store
    console.error('Login failed:', error)
  }
}

const handleGoogleLogin = () => {
  const googleLoginUrl = authService.getGoogleLoginUrl()
  // Redirect to Google OAuth
  window.location.href = googleLoginUrl
}
</script>
