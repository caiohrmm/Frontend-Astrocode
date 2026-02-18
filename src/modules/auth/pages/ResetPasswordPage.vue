<template>
  <v-card
    class="reset-password-card"
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
          mdi-key-variant
        </v-icon>
        <h1 class="text-h4 font-weight-bold mb-2">
          Nova senha
        </h1>
        <p class="text-body-1 text-medium-emphasis text-center">
          Digite sua nova senha abaixo.
        </p>
      </div>
    </v-card-title>

    <v-card-text class="pa-6 pt-2">
      <v-alert
        v-if="successMessage"
        type="success"
        variant="tonal"
        density="compact"
        class="mb-6"
      >
        {{ successMessage }}
        <div class="mt-2">
          <v-btn
            color="success"
            variant="tonal"
            size="small"
            :to="{ name: 'login' }"
          >
            Ir para login
          </v-btn>
        </div>
      </v-alert>

      <v-alert
        v-else-if="errorMessage"
        type="error"
        variant="tonal"
        density="compact"
        class="mb-6"
      >
        {{ errorMessage }}
      </v-alert>

      <template v-if="!token">
        <v-alert
          type="warning"
          variant="tonal"
          class="mb-6"
        >
          Link inválido ou expirado. Solicite uma nova redefinição de senha.
        </v-alert>
        <v-btn
          block
          variant="outlined"
          :to="{ name: 'forgot-password' }"
        >
          Solicitar novo link
        </v-btn>
      </template>

      <v-form
        v-else-if="!successMessage"
        ref="formRef"
        @submit.prevent="handleSubmit"
      >
        <v-text-field
          v-model="newPassword"
          label="Nova senha"
          :type="showPassword ? 'text' : 'password'"
          prepend-inner-icon="mdi-lock-outline"
          variant="outlined"
          density="comfortable"
          class="mb-3"
          :disabled="isLoading"
          :rules="[rules.required, rules.minLength]"
          autocomplete="new-password"
          :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
          @click:append-inner="showPassword = !showPassword"
        ></v-text-field>

        <v-text-field
          v-model="confirmPassword"
          label="Confirmar nova senha"
          :type="showPassword ? 'text' : 'password'"
          prepend-inner-icon="mdi-lock-check-outline"
          variant="outlined"
          density="comfortable"
          class="mb-4"
          :disabled="isLoading"
          :rules="[rules.required, rules.confirmMatch]"
          autocomplete="new-password"
        ></v-text-field>

        <v-btn
          color="primary"
          block
          size="large"
          type="submit"
          :loading="isLoading"
          :disabled="isLoading || !isFormValid"
          class="mb-4"
          elevation="2"
        >
          <v-icon start>mdi-check</v-icon>
          Redefinir senha
        </v-btn>
      </v-form>

      <div v-if="!successMessage" class="text-center mt-4">
        <v-btn
          variant="text"
          size="small"
          :to="{ name: 'login' }"
        >
          <v-icon start size="18">mdi-arrow-left</v-icon>
          Voltar ao login
        </v-btn>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import type { VForm } from 'vuetify/components'
import { authService } from '@/shared/services/auth.service'

const route = useRoute()
const formRef = ref<VForm | null>(null)
const newPassword = ref('')
const confirmPassword = ref('')
const showPassword = ref(false)
const isLoading = ref(false)
const successMessage = ref('')
const errorMessage = ref('')
const token = ref('')

onMounted(() => {
  token.value = (route.query.token as string) || ''
})

const rules = {
  required: (value: string) => {
    if (!value || !value.trim()) return 'Campo obrigatório'
    return true
  },
  minLength: (value: string) => {
    if (!value) return true
    return value.length >= 6 || 'Senha deve ter no mínimo 6 caracteres'
  },
  confirmMatch: (value: string) => {
    if (!value) return true
    return value === newPassword.value || 'As senhas não coincidem'
  },
}

const isFormValid = computed(() => {
  return (
    newPassword.value.length >= 6 &&
    confirmPassword.value === newPassword.value
  )
})

const handleSubmit = async () => {
  const { valid } = (await formRef.value?.validate()) ?? { valid: false }
  if (!valid) return

  isLoading.value = true
  errorMessage.value = ''

  try {
    const response = await authService.resetPassword(token.value, newPassword.value)
    successMessage.value = response.message || 'Senha alterada com sucesso. Faça login com a nova senha.'
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Erro ao redefinir senha. O link pode ter expirado.'
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.reset-password-card {
  width: 100%;
  margin: 0 auto;
}
</style>
