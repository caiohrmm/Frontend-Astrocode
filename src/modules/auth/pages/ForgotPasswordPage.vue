<template>
  <div class="forgot-password-wrapper">
    <v-card
      class="forgot-password-card"
      elevation="8"
      rounded="xl"
      max-width="440"
    >
      <!-- Header: só ícone + título (subtítulo vai no body para não cortar) -->
      <v-card-title class="forgot-password-header">
        <div class="forgot-password-header-inner">
          <v-icon
            size="56"
            color="primary"
            class="mb-3"
          >
            mdi-lock-reset
          </v-icon>
          <h1 class="forgot-password-title text-h5 text-sm-h4 font-weight-bold">
            Esqueceu sua senha?
          </h1>
        </div>
      </v-card-title>

      <v-divider />

      <v-card-text class="forgot-password-body">
        <!-- Subtítulo aqui para garantir quebra de linha (fora do v-card-title) -->
        <p
          v-if="!successMessage"
          class="forgot-password-subtitle text-body-2 text-sm-body-1 text-medium-emphasis text-center mb-4"
        >
          Informe seu email e enviaremos um link para redefinir sua senha.
        </p>
        <!-- Sucesso: estado compacto e claro -->
        <template v-else-if="successMessage">
          <div class="forgot-password-success">
            <v-icon
              size="48"
              color="success"
              class="mb-3"
            >
              mdi-check-circle
            </v-icon>
            <p class="text-body-2 text-sm-body-1 text-center text-medium-emphasis mb-4">
              Se o email existir em nossa base, você receberá um link para redefinir sua senha.
            </p>
            <p class="text-caption text-center text-medium-emphasis mb-4">
              Verifique sua caixa de entrada e a pasta de spam.
            </p>
            <v-btn
              color="primary"
              variant="tonal"
              block
              :to="{ name: 'login' }"
              class="mt-2"
            >
              <v-icon start size="20">mdi-arrow-left</v-icon>
              Voltar ao login
            </v-btn>
          </div>
        </template>

        <!-- Erro -->
        <v-alert
          v-if="errorMessage"
          type="error"
          variant="tonal"
          density="compact"
          class="mb-4 text-wrap"
          closable
          @click:close="errorMessage = ''"
        >
          <span class="text-body-2">{{ errorMessage }}</span>
        </v-alert>

        <!-- Formulário -->
        <v-form
          v-if="!successMessage"
          ref="formRef"
          @submit.prevent="handleSubmit"
          class="forgot-password-form"
        >
          <v-text-field
            v-model="email"
            label="Email"
            type="email"
            prepend-inner-icon="mdi-email-outline"
            variant="outlined"
            density="comfortable"
            hide-details="auto"
            class="mb-4"
            :disabled="isLoading"
            :rules="[rules.required, rules.email]"
            autocomplete="email"
            clearable
          />

          <v-btn
            color="primary"
            block
            size="large"
            type="submit"
            :loading="isLoading"
            :disabled="isLoading || !email.trim()"
            class="mb-3"
            elevation="2"
          >
            <v-icon start>mdi-email-send</v-icon>
            Enviar link
          </v-btn>

          <div class="text-center pt-2">
            <v-btn
              variant="text"
              size="small"
              color="medium-emphasis"
              :to="{ name: 'login' }"
              :disabled="isLoading"
            >
              <v-icon start size="18">mdi-arrow-left</v-icon>
              Voltar ao login
            </v-btn>
          </div>
        </v-form>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { VForm } from 'vuetify/components'
import { authService } from '@/shared/services/auth.service'

const formRef = ref<VForm | null>(null)
const email = ref('')
const isLoading = ref(false)
const successMessage = ref('')
const errorMessage = ref('')

const rules = {
  required: (value: string) => {
    if (!value || !value.trim()) return 'Campo obrigatório'
    return true
  },
  email: (value: string) => {
    if (!value) return true
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return pattern.test(value) || 'Email inválido'
  },
}

const handleSubmit = async () => {
  const { valid } = (await formRef.value?.validate()) ?? { valid: false }
  if (!valid) return

  isLoading.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    const response = await authService.forgotPassword(email.value.trim().toLowerCase())
    successMessage.value = response.message || 'ok'
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Erro ao enviar. Tente novamente.'
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.forgot-password-wrapper {
  width: 100%;
  max-width: 440px;
  margin: 0 auto;
  padding: 16px;
  box-sizing: border-box;
}

.forgot-password-card {
  width: 100%;
  min-width: 0;
  overflow-x: hidden; /* só evita barra horizontal; vertical pode rolar no layout */
}

.forgot-password-header {
  padding: 24px 20px 20px !important;
  overflow: visible;
}

@media (min-width: 600px) {
  .forgot-password-header {
    padding: 32px 28px 24px !important;
  }
}

/* Garante que o header use a largura do card e não estoure */
.forgot-password-header-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  width: 100%;
  min-width: 0; /* permite o flex shrink e a quebra de linha */
}

.forgot-password-title {
  width: 100%;
  word-wrap: break-word;
  overflow-wrap: break-word;
  line-height: 1.25;
}

.forgot-password-subtitle {
  width: 100%;
  max-width: 100%;
  min-width: 0;
  word-wrap: break-word;
  overflow-wrap: anywhere;
  line-height: 1.5;
  box-sizing: border-box;
  padding: 0 8px;
}

.forgot-password-body {
  padding: 20px !important;
  width: 100%;
  min-width: 0;
  box-sizing: border-box;
}

@media (min-width: 600px) {
  .forgot-password-body {
    padding: 28px !important;
  }
}

.forgot-password-form {
  min-width: 0; /* evita overflow em flex */
}

.forgot-password-success {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px 0;
}

/* Garante que textos longos quebrem dentro do card */
:deep(.v-alert__content),
:deep(.v-messages) {
  word-wrap: break-word;
  overflow-wrap: break-word;
}

/* Card title e text do Vuetify: conteúdo usa toda a largura para o texto quebrar */
:deep(.v-card-title),
:deep(.v-card-text) {
  width: 100%;
  min-width: 0;
  box-sizing: border-box;
}
</style>
