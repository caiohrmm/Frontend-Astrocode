<template>
  <v-app>
    <v-app-bar color="primary" prominent>
      <v-app-bar-nav-icon></v-app-bar-nav-icon>
      <v-toolbar-title>Astrocode Backend</v-toolbar-title>
      <v-spacer></v-spacer>
      
      <v-menu
        v-model="userMenu"
        location="bottom end"
        transition="scale-transition"
      >
        <template #activator="{ props }">
          <v-btn
            icon
            v-bind="props"
            class="mr-2"
          >
            <v-icon>mdi-account-circle</v-icon>
          </v-btn>
        </template>

        <v-card min-width="280" elevation="8">
          <v-card-text class="pa-4">
            <div class="d-flex align-center mb-4">
              <v-avatar
                color="primary"
                size="48"
                class="mr-3"
              >
                <v-icon color="white" size="28">
                  mdi-account
                </v-icon>
              </v-avatar>
              <div class="flex-grow-1">
                <div class="text-subtitle-1 font-weight-bold">
                  {{ authStore.user?.full_name || 'Usuário' }}
                </div>
                <div class="text-caption text-medium-emphasis">
                  {{ authStore.user?.email }}
                </div>
              </div>
            </div>

            <v-divider class="mb-3"></v-divider>

            <div class="mb-3">
              <div class="text-caption text-medium-emphasis mb-1">
                Roles:
              </div>
              <div class="d-flex flex-wrap gap-1">
                <v-chip
                  v-for="role in authStore.userRoles"
                  :key="role"
                  size="small"
                  color="primary"
                  variant="tonal"
                >
                  {{ role }}
                </v-chip>
              </div>
            </div>

            <v-divider class="mb-3"></v-divider>

            <v-btn
              color="error"
              variant="text"
              block
              prepend-icon="mdi-logout"
              @click="handleLogout"
            >
              Sair
            </v-btn>
          </v-card-text>
        </v-card>
      </v-menu>
    </v-app-bar>

    <v-navigation-drawer permanent>
      <v-list>
        <v-list-item
          prepend-icon="mdi-view-dashboard"
          title="Dashboard"
          value="dashboard"
          :to="{ name: 'dashboard' }"
        ></v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-main>
      <v-container fluid>
        <router-view />
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/app/store/auth.store'

const router = useRouter()
const authStore = useAuthStore()

const userMenu = ref(false)

const handleLogout = async () => {
  await authStore.logout()
  userMenu.value = false
  router.push({ name: 'login' })
}
</script>
