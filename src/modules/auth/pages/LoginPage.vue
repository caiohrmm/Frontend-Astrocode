<template>
  <v-card>
    <v-card-title class="text-h5 text-center pa-6">
      Login
    </v-card-title>
    <v-card-text>
      <v-form>
        <v-text-field
          v-model="email"
          label="Email"
          type="email"
          prepend-inner-icon="mdi-email"
          variant="outlined"
          class="mb-4"
        ></v-text-field>
        <v-text-field
          v-model="password"
          label="Senha"
          type="password"
          prepend-inner-icon="mdi-lock"
          variant="outlined"
          class="mb-4"
        ></v-text-field>
        <v-btn
          color="primary"
          block
          size="large"
          @click="handleLogin"
        >
          Entrar
        </v-btn>
      </v-form>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const email = ref('')
const password = ref('')

const handleLogin = () => {
  // Login logic will be implemented later
  console.log('Login clicked', { email: email.value, password: password.value })
}
</script>


