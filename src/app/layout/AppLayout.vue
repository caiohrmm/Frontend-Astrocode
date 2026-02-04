<template>
  <v-app>
    <v-app-bar color="primary" prominent>
      <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
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
              @click="showLogoutDialog = true"
            >
              Sair
            </v-btn>
          </v-card-text>
        </v-card>
      </v-menu>
    </v-app-bar>

    <!-- Logout Confirmation Dialog -->
    <v-dialog
      v-model="showLogoutDialog"
      max-width="400"
      persistent
    >
      <v-card>
        <v-card-title class="d-flex align-center">
          <v-icon
            color="warning"
            class="mr-3"
            size="32"
          >
            mdi-alert-circle-outline
          </v-icon>
          <span class="text-h6">Confirmar saída</span>
        </v-card-title>

        <v-card-text class="pt-4">
          <p class="text-body-1">
            Tem certeza que deseja sair da sua conta?
          </p>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            variant="text"
            @click="showLogoutDialog = false"
          >
            Cancelar
          </v-btn>
          <v-btn
            color="error"
            variant="flat"
            prepend-icon="mdi-logout"
            :loading="isLoggingOut"
            @click="handleLogout"
          >
            Sair
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-navigation-drawer
      v-model="drawer"
      temporary
    >
      <v-list>
        <v-list-item
          prepend-icon="mdi-view-dashboard"
          title="Dashboard"
          value="dashboard"
          :to="{ name: 'dashboard' }"
          @click="drawer = false"
        ></v-list-item>
        <v-list-item
          v-if="authStore.hasRole.value('gestor')"
          prepend-icon="mdi-account-group"
          title="Usuários"
          value="users"
          :to="{ name: 'users' }"
          @click="drawer = false"
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
const showLogoutDialog = ref(false)
const isLoggingOut = ref(false)
const drawer = ref(false)

const handleLogout = async () => {
  isLoggingOut.value = true
  try {
    await authStore.logout()
    userMenu.value = false
    showLogoutDialog.value = false
    router.push({ name: 'login' })
  } catch (error) {
    console.error('Logout error:', error)
  } finally {
    isLoggingOut.value = false
  }
}
</script>
