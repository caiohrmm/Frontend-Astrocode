<template>
  <div>
    <v-card elevation="2">
      <v-card-title class="pa-4">
        <v-icon class="mr-3" color="primary">mdi-home-plus</v-icon>
        {{ isEditMode ? 'Editar Imóvel' : 'Novo Imóvel' }}
      </v-card-title>
      <v-card-text class="pa-4">
        <p class="text-body-1 text-medium-emphasis">
          Formulário de imóvel será implementado em breve.
        </p>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const isEditMode = computed(() => !!route.params.id)
</script>

