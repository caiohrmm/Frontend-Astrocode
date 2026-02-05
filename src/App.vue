<template>
  <AppLayout v-if="isAppLayout">
    <router-view />
  </AppLayout>
  <AuthLayout v-else>
    <router-view />
  </AuthLayout>
  <AiChatWidget v-if="isAppLayout" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AppLayout from '@/app/layout/AppLayout.vue'
import AuthLayout from '@/app/layout/AuthLayout.vue'
import AiChatWidget from '@/shared/components/AiChatWidget.vue'

const route = useRoute()

const isAppLayout = computed(() => {
  const layoutName = route.meta.layout as string || 'app'
  return layoutName !== 'auth'
})
</script>
