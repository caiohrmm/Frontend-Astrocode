<template>
  <v-card
    class="register-card"
    elevation="8"
    rounded="xl"
  >
    <v-card-title class="text-center pa-8 pb-4">
      <div class="d-flex flex-column align-center">
        <v-icon
          size="64"
          color="primary"
          class="mb-4"
        >
          mdi-account-plus
        </v-icon>
        <h1 class="text-h4 font-weight-bold mb-2">
          Criar Conta
        </h1>
        <p class="text-body-1 text-medium-emphasis">
          Registre-se para começar
        </p>
      </div>
    </v-card-title>

    <v-card-text class="pa-6 pt-2">
      <v-alert
        v-if="authStore.error"
        type="error"
        variant="tonal"
        density="compact"
        class="mb-6"
        closable
        @click:close="authStore.clearError()"
      >
        {{ authStore.error }}
      </v-alert>

      <v-form
        ref="formRef"
        @submit.prevent="handleRegister"
      >
        <v-text-field
          v-model="fullName"
          label="Nome Completo"
          prepend-inner-icon="mdi-account-outline"
          variant="outlined"
          density="comfortable"
          class="mb-4"
          :disabled="authStore.isLoading"
          :rules="[rules.required, rules.minLengthName]"
          :error-messages="fullNameErrors"
          autocomplete="name"
          clearable
          @click:clear="fullName = ''"
        ></v-text-field>

        <v-text-field
          v-model="email"
          label="Email"
          type="email"
          prepend-inner-icon="mdi-email-outline"
          variant="outlined"
          density="comfortable"
          class="mb-4"
          :disabled="authStore.isLoading"
          :rules="[rules.required, rules.email]"
          :error-messages="emailErrors"
          autocomplete="email"
          clearable
          @click:clear="email = ''"
        ></v-text-field>

        <v-text-field
          v-model="password"
          label="Senha"
          :type="showPassword ? 'text' : 'password'"
          prepend-inner-icon="mdi-lock-outline"
          variant="outlined"
          density="comfortable"
          class="mb-2"
          :disabled="authStore.isLoading"
          :rules="[rules.required, rules.minLength]"
          :error-messages="passwordErrors"
          autocomplete="new-password"
          :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
          @click:append-inner="showPassword = !showPassword"
        ></v-text-field>

        <v-text-field
          v-model="confirmPassword"
          label="Confirmar Senha"
          :type="showConfirmPassword ? 'text' : 'password'"
          prepend-inner-icon="mdi-lock-check-outline"
          variant="outlined"
          density="comfortable"
          class="mb-4"
          :disabled="authStore.isLoading"
          :rules="[rules.required, rules.passwordMatch]"
          :error-messages="confirmPasswordErrors"
          autocomplete="new-password"
          :append-inner-icon="showConfirmPassword ? 'mdi-eye-off' : 'mdi-eye'"
          @click:append-inner="showConfirmPassword = !showConfirmPassword"
        ></v-text-field>

        <v-alert
          type="info"
          variant="tonal"
          density="compact"
          class="mb-4"
        >
          <div class="text-caption">
            Todos os usuários são registrados como <strong>Atendente</strong> por padrão.
            Apenas gestores podem alterar cargos posteriormente.
          </div>
        </v-alert>

        <v-btn
          color="primary"
          block
          size="large"
          type="submit"
          :loading="authStore.isLoading"
          :disabled="authStore.isLoading || !isFormValid"
          class="mb-4 mt-2"
          elevation="2"
        >
          <v-icon start>mdi-account-plus</v-icon>
          Criar Conta
        </v-btn>
      </v-form>

      <v-divider class="my-6">
        <span class="text-caption text-medium-emphasis px-4">
          ou
        </span>
      </v-divider>

      <v-btn
        variant="outlined"
        block
        size="large"
        :disabled="authStore.isLoading"
        class="google-btn"
        @click="handleGoogleLogin"
      >
        <v-icon
          start
          color="red"
          size="24"
        >
          mdi-google
        </v-icon>
        Continuar com Google
      </v-btn>

      <div class="text-center mt-6">
        <span class="text-body-2 text-medium-emphasis">
          Já tem uma conta?
        </span>
        <v-btn
          variant="text"
          size="small"
          class="ml-2"
          @click="goToLogin"
        >
          Fazer Login
        </v-btn>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import type { VForm } from 'vuetify/components'
import { useAuthStore } from '@/app/store/auth.store'
import { authService } from '@/shared/services/auth.service'

const router = useRouter()
const authStore = useAuthStore()

const formRef = ref<VForm | null>(null)
const fullName = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const showPassword = ref(false)
const showConfirmPassword = ref(false)

const rules = {
  required: (value: string) => {
    if (!value || !value.trim()) {
      return 'Campo obrigatório'
    }
    return true
  },
  email: (value: string) => {
    if (!value) return true
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return pattern.test(value) || 'Email inválido'
  },
  minLength: (value: string) => {
    if (!value) return true
    return value.length >= 8 || 'Senha deve ter no mínimo 8 caracteres'
  },
  minLengthName: (value: string) => {
    if (!value) return true
    return value.trim().length >= 3 || 'Nome deve ter no mínimo 3 caracteres'
  },
  passwordMatch: (value: string) => {
    if (!value) return true
    return value === password.value || 'As senhas não coincidem'
  },
}

const fullNameErrors = computed(() => {
  if (!fullName.value) return []
  const requiredRule = rules.required(fullName.value)
  const minLengthRule = rules.minLengthName(fullName.value)
  const errors: string[] = []
  if (requiredRule !== true) errors.push(requiredRule)
  if (minLengthRule !== true) errors.push(minLengthRule)
  return errors
})

const emailErrors = computed(() => {
  if (!email.value) return []
  const emailRule = rules.email(email.value)
  return emailRule === true ? [] : [emailRule]
})

const passwordErrors = computed(() => {
  if (!password.value) return []
  const minLengthRule = rules.minLength(password.value)
  return minLengthRule === true ? [] : [minLengthRule]
})

const confirmPasswordErrors = computed(() => {
  if (!confirmPassword.value) return []
  const matchRule = rules.passwordMatch(confirmPassword.value)
  return matchRule === true ? [] : [matchRule]
})

const isFormValid = computed(() => {
  return (
    fullName.value.trim().length >= 3 &&
    email.value.trim().length > 0 &&
    password.value.length >= 8 &&
    confirmPassword.value === password.value &&
    rules.email(email.value) === true
  )
})

const handleRegister = async () => {
  const { valid } = await formRef.value?.validate() ?? { valid: false }
  
  if (!valid) {
    return
  }

  if (password.value !== confirmPassword.value) {
    return
  }

  try {
    await authStore.register({
      email: email.value.trim().toLowerCase(),
      password: password.value,
      full_name: fullName.value.trim(),
    })
    
    // Redirect based on user role (new users are always atendente, so redirect to clients)
    router.push({ name: 'clients' })
  } catch (error) {
    // Error is already handled by the store
    console.error('Registration failed:', error)
  }
}

const handleGoogleLogin = () => {
  const googleLoginUrl = authService.getGoogleLoginUrl()
  // Redirect to Google OAuth
  window.location.href = googleLoginUrl
}

const goToLogin = () => {
  router.push({ name: 'login' })
}
</script>

<style scoped>
.register-card {
  width: 100%;
  margin: 0 auto;
}

.google-btn {
  border: 1px solid rgba(0, 0, 0, 0.12);
  transition: all 0.3s ease;
  color: rgba(0, 0, 0, 0.87) !important;
}

.google-btn:hover {
  background-color: rgba(0, 0, 0, 0.02);
  border-color: rgba(0, 0, 0, 0.24);
}

.google-btn:disabled {
  opacity: 0.6;
}
</style>

