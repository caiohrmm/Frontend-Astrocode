<template>
  <div>
    <v-card elevation="2" class="mb-4">
      <v-card-title class="d-flex align-center pa-4">
        <v-icon class="mr-3" size="32">mdi-account-group</v-icon>
        <span class="text-h5">Gerenciamento de Usuários</span>
        <v-spacer></v-spacer>
        <v-btn
          color="primary"
          prepend-icon="mdi-refresh"
          @click="loadUsers"
        >
          Atualizar
        </v-btn>
      </v-card-title>
    </v-card>

    <v-card elevation="2">
      <v-data-table
        :headers="headers"
        :items="users"
        :loading="isLoading"
        :items-per-page="10"
        :items-per-page-options="[10, 25, 50, 100]"
        class="elevation-0"
        item-value="id"
      >
        <template #item.full_name="{ item }">
          <div class="d-flex align-center">
            <v-avatar
              color="primary"
              size="32"
              class="mr-3"
            >
              <v-icon color="white" size="18">
                mdi-account
              </v-icon>
            </v-avatar>
            <span class="font-weight-medium">{{ item.full_name }}</span>
          </div>
        </template>

        <template #item.email="{ item }">
          <span class="text-body-2">{{ item.email }}</span>
        </template>

        <template #item.roles="{ item }">
          <div class="d-flex flex-wrap gap-1">
            <v-chip
              v-for="role in item.roles"
              :key="role.id"
              size="small"
              :color="getRoleColor(role.name)"
              variant="tonal"
            >
              {{ role.name }}
            </v-chip>
          </div>
        </template>

        <template #item.is_active="{ item }">
          <v-chip
            :color="item.is_active ? 'success' : 'error'"
            size="small"
            variant="tonal"
          >
            <v-icon
              start
              size="16"
            >
              {{ item.is_active ? 'mdi-check-circle' : 'mdi-close-circle' }}
            </v-icon>
            {{ item.is_active ? 'Ativo' : 'Inativo' }}
          </v-chip>
        </template>

        <template #item.created_at="{ item }">
          <span class="text-caption">
            {{ formatDate(item.created_at) }}
          </span>
        </template>

        <template #item.actions="{ item }">
          <div class="d-flex gap-2">
            <v-btn
              icon
              size="small"
              variant="text"
              color="primary"
              @click="openEditRolesDialog(item)"
            >
              <v-icon>mdi-account-cog</v-icon>
              <v-tooltip activator="parent" location="top">
                Editar Roles
              </v-tooltip>
            </v-btn>
            <v-btn
              icon
              size="small"
              variant="text"
              :color="item.is_active ? 'error' : 'success'"
              @click="openToggleStatusDialog(item)"
            >
              <v-icon>
                {{ item.is_active ? 'mdi-account-off' : 'mdi-account-check' }}
              </v-icon>
              <v-tooltip activator="parent" location="top">
                {{ item.is_active ? 'Desativar' : 'Ativar' }} Usuário
              </v-tooltip>
            </v-btn>
          </div>
        </template>

        <template #no-data>
          <div class="text-center pa-8">
            <v-icon size="64" color="grey-lighten-1">mdi-account-off</v-icon>
            <p class="text-h6 mt-4 text-grey">Nenhum usuário encontrado</p>
          </div>
        </template>
      </v-data-table>
    </v-card>

    <!-- Edit Roles Dialog -->
    <v-dialog
      v-model="editRolesDialog"
      max-width="500"
      persistent
    >
      <v-card>
        <v-card-title class="d-flex align-center pa-4">
          <v-icon class="mr-3" color="primary">mdi-account-cog</v-icon>
          <span class="text-h6">Editar Roles</span>
        </v-card-title>

        <v-card-text class="pa-4">
          <div class="mb-4">
            <p class="text-subtitle-1 font-weight-bold mb-1">
              {{ selectedUser?.full_name }}
            </p>
            <p class="text-caption text-medium-emphasis">
              {{ selectedUser?.email }}
            </p>
          </div>

          <v-divider class="mb-4"></v-divider>

          <div>
            <p class="text-body-2 font-weight-medium mb-3">
              Selecione as roles do usuário:
            </p>
            <v-checkbox
              v-for="role in availableRoles"
              :key="role"
              v-model="selectedRoles"
              :label="getRoleLabel(role)"
              :value="role"
              color="primary"
              hide-details
              class="mb-2"
            ></v-checkbox>
          </div>
        </v-card-text>

        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn
            variant="text"
            @click="closeEditRolesDialog"
          >
            Cancelar
          </v-btn>
          <v-btn
            color="primary"
            variant="flat"
            :loading="isUpdatingRoles"
            @click="saveUserRoles"
          >
            Salvar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Confirmação Ativar/Desativar Usuário -->
    <v-dialog
      v-model="toggleStatusDialog"
      max-width="420"
      persistent
    >
      <v-card>
        <v-card-title class="d-flex align-center pa-4">
          <v-icon
            class="mr-3"
            :color="userToToggle?.is_active ? 'error' : 'success'"
            size="28"
          >
            {{ userToToggle?.is_active ? 'mdi-account-off' : 'mdi-account-check' }}
          </v-icon>
          <span class="text-h6">
            {{ userToToggle?.is_active ? 'Desativar' : 'Ativar' }} usuário
          </span>
        </v-card-title>
        <v-card-text class="pa-4 pt-0">
          <p class="text-body-1">
            Tem certeza que deseja
            <strong>{{ userToToggle?.is_active ? 'desativar' : 'ativar' }}</strong>
            o usuário <strong>{{ userToToggle?.full_name }}</strong>?
          </p>
          <p
            v-if="userToToggle?.is_active"
            class="text-caption text-medium-emphasis mt-2"
          >
            Usuários desativados não poderão fazer login no sistema.
          </p>
        </v-card-text>
        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn
            variant="text"
            @click="closeToggleStatusDialog"
          >
            Cancelar
          </v-btn>
          <v-btn
            :color="userToToggle?.is_active ? 'error' : 'success'"
            variant="flat"
            :loading="isTogglingStatus"
            @click="confirmToggleUserStatus"
          >
            {{ userToToggle?.is_active ? 'Desativar' : 'Ativar' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { usersService, type User } from '@/shared/services/users.service'
import { useAuthStore } from '@/app/store/auth.store'

const _authStore = useAuthStore()

const users = ref<User[]>([])
const isLoading = ref(false)
const editRolesDialog = ref(false)
const toggleStatusDialog = ref(false)
const userToToggle = ref<User | null>(null)
const isTogglingStatus = ref(false)
const selectedUser = ref<User | null>(null)
const selectedRoles = ref<string[]>([])
const isUpdatingRoles = ref(false)

const availableRoles = ['atendente', 'corretor', 'gestor']

const headers = [
  {
    title: 'Nome',
    key: 'full_name',
    sortable: true,
  },
  {
    title: 'Email',
    key: 'email',
    sortable: true,
  },
  {
    title: 'Roles',
    key: 'roles',
    sortable: false,
  },
  {
    title: 'Status',
    key: 'is_active',
    sortable: true,
  },
  {
    title: 'Criado em',
    key: 'created_at',
    sortable: true,
  },
  {
    title: 'Ações',
    key: 'actions',
    sortable: false,
  },
]

const getRoleColor = (roleName: string): string => {
  const colors: Record<string, string> = {
    gestor: 'error',
    corretor: 'warning',
    atendente: 'info',
  }
  return colors[roleName] || 'grey'
}

const getRoleLabel = (roleName: string): string => {
  const labels: Record<string, string> = {
    gestor: 'Gestor',
    corretor: 'Corretor',
    atendente: 'Atendente',
  }
  return labels[roleName] || roleName
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const loadUsers = async () => {
  isLoading.value = true
  try {
    users.value = await usersService.listUsers()
  } catch (error) {
    console.error('Error loading users:', error)
    // TODO: Show error notification
  } finally {
    isLoading.value = false
  }
}

const openEditRolesDialog = (user: User) => {
  selectedUser.value = user
  selectedRoles.value = user.roles.map(role => role.name)
  editRolesDialog.value = true
}

const closeEditRolesDialog = () => {
  editRolesDialog.value = false
  selectedUser.value = null
  selectedRoles.value = []
}

const saveUserRoles = async () => {
  if (!selectedUser.value) return

  isUpdatingRoles.value = true
  try {
    const updatedUser = await usersService.updateUserRoles(
      selectedUser.value.id,
      selectedRoles.value
    )
    
    // Update user in list
    const index = users.value.findIndex(u => u.id === updatedUser.id)
    if (index !== -1) {
      users.value[index] = updatedUser
    }
    
    closeEditRolesDialog()
    // TODO: Show success notification
  } catch (error) {
    console.error('Error updating user roles:', error)
    // TODO: Show error notification
  } finally {
    isUpdatingRoles.value = false
  }
}

const openToggleStatusDialog = (user: User) => {
  userToToggle.value = user
  toggleStatusDialog.value = true
}

const closeToggleStatusDialog = () => {
  toggleStatusDialog.value = false
  userToToggle.value = null
}

const confirmToggleUserStatus = async () => {
  if (!userToToggle.value) return

  isTogglingStatus.value = true
  try {
    const updatedUser = await usersService.updateUser(userToToggle.value.id, {
      is_active: !userToToggle.value.is_active,
    })

    const index = users.value.findIndex(u => u.id === updatedUser.id)
    if (index !== -1) {
      users.value[index] = updatedUser
    }

    closeToggleStatusDialog()
    // TODO: Show success notification
  } catch (error) {
    console.error('Error updating user status:', error)
    alert(error instanceof Error ? error.message : 'Erro ao atualizar status do usuário')
  } finally {
    isTogglingStatus.value = false
  }
}

onMounted(() => {
  loadUsers()
})
</script>

<style scoped>
:deep(.v-data-table) {
  background-color: transparent;
}
</style>

