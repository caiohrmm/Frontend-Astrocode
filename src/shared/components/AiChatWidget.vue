<template>
  <div class="ai-chat-widget">
    <!-- Floating Chat Button -->
    <v-btn
      v-if="!isOpen"
      class="chat-button"
      color="primary"
      icon="mdi-robot"
      size="large"
      elevation="8"
      @click="openChat"
    >
      <v-icon>mdi-robot</v-icon>
      <v-tooltip activator="parent" location="top">
        Assistente AI
      </v-tooltip>
    </v-btn>

    <!-- Chat Dialog -->
    <v-dialog
      v-model="isOpen"
      max-width="500"
      persistent
      scrollable
    >
      <v-card class="chat-dialog">
        <!-- Header -->
        <v-card-title class="d-flex align-center justify-space-between bg-primary text-white">
          <div class="d-flex align-center">
            <v-icon class="mr-2">mdi-robot</v-icon>
            <span>Assistente AI</span>
          </div>
          <v-btn
            icon="mdi-close"
            variant="text"
            color="white"
            size="small"
            @click="closeChat"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        
        <!-- Context Banner -->
        <v-card
          v-if="currentContext && contextDescription && useContext"
          variant="tonal"
          color="info"
          class="ma-3"
        >
          <v-card-text class="pa-2">
            <div class="d-flex align-center justify-space-between">
              <div class="d-flex align-center">
                <v-icon color="info" size="small" class="mr-2">mdi-information</v-icon>
                <span class="text-caption">
                  Respondendo com contexto: <strong>{{ contextDescription }}</strong>
                </span>
              </div>
              <v-btn
                icon
                size="x-small"
                variant="text"
                @click="useContext = false"
              >
                <v-icon size="small">mdi-close</v-icon>
              </v-btn>
            </div>
          </v-card-text>
        </v-card>
        
        <!-- No Context Banner -->
        <v-card
          v-else-if="!useContext && currentContext"
          variant="tonal"
          color="warning"
          class="ma-3"
        >
          <v-card-text class="pa-2">
            <div class="d-flex align-center justify-space-between">
              <div class="d-flex align-center">
                <v-icon color="warning" size="small" class="mr-2">mdi-alert-circle</v-icon>
                <span class="text-caption">
                  Contexto desabilitado. Faça perguntas gerais sobre o sistema.
                </span>
              </div>
              <v-btn
                size="x-small"
                variant="text"
                color="warning"
                @click="useContext = true"
              >
                Ativar
              </v-btn>
            </div>
          </v-card-text>
        </v-card>

        <!-- Messages Container -->
        <v-card-text class="messages-container pa-0">
          <div
            v-if="messages.length === 0"
            class="empty-state text-center pa-8"
          >
            <v-icon size="64" color="grey-lighten-1" class="mb-4">mdi-robot</v-icon>
            <p class="text-body-1 text-grey">Olá! Como posso ajudar você hoje?</p>
            <p class="text-caption text-grey-lighten-1 mt-2">
              Faça perguntas sobre clientes, propriedades ou atendimentos
            </p>
            
            <!-- Context Info -->
            <v-card
              v-if="currentContext && contextDescription"
              variant="outlined"
              color="primary"
              class="mt-4"
            >
              <v-card-text class="pa-3">
                <div class="d-flex align-center justify-space-between">
                  <div class="d-flex align-center">
                    <v-icon color="primary" size="small" class="mr-2">mdi-information</v-icon>
                    <span class="text-body-2">
                      Contexto ativo: <strong>{{ contextDescription }}</strong>
                    </span>
                  </div>
                  <v-switch
                    v-model="useContext"
                    density="compact"
                    hide-details
                    color="primary"
                    class="ml-2"
                  >
                    <template #label>
                      <span class="text-caption">Usar contexto</span>
                    </template>
                  </v-switch>
                </div>
              </v-card-text>
            </v-card>
            
            <!-- Suggested Questions -->
            <div v-if="suggestedQuestions.length > 0 && useContext" class="mt-4">
              <p class="text-caption text-grey mb-2">Perguntas sugeridas:</p>
              <div class="d-flex flex-column gap-2">
                <v-chip
                  v-for="(question, index) in suggestedQuestions"
                  :key="index"
                  size="small"
                  variant="outlined"
                  color="primary"
                  class="justify-start"
                  @click="inputMessage = question"
                >
                  {{ question }}
                </v-chip>
              </div>
            </div>
          </div>

          <div v-else class="messages-list pa-4">
            <div
              v-for="(message, index) in messages"
              :key="index"
              class="message-wrapper mb-4"
              :class="{ 'user-message': message.role === 'user', 'ai-message': message.role === 'ai' }"
            >
              <v-card
                :color="message.role === 'user' ? 'primary' : 'grey-lighten-4'"
                :variant="message.role === 'user' ? 'flat' : 'outlined'"
                class="message-card"
              >
                <v-card-text class="pa-3">
                  <div class="d-flex align-start">
                    <v-icon
                      :color="message.role === 'user' ? 'white' : 'primary'"
                      class="mr-2"
                      size="small"
                    >
                      {{ message.role === 'user' ? 'mdi-account' : 'mdi-robot' }}
                    </v-icon>
                    <div class="message-content flex-grow-1">
                      <div
                        class="text-body-2"
                        :class="message.role === 'user' ? 'text-white' : 'text-grey-darken-1'"
                        style="white-space: pre-wrap; word-wrap: break-word;"
                      >
                        {{ message.content }}
                      </div>
                      <div
                        v-if="message.timestamp"
                        class="text-caption mt-1"
                        :class="message.role === 'user' ? 'text-white' : 'text-grey'"
                        style="opacity: 0.7;"
                      >
                        {{ formatTime(message.timestamp) }}
                      </div>
                    </div>
                  </div>
                </v-card-text>
              </v-card>
            </div>

            <!-- Loading Indicator -->
            <div v-if="isLoading" class="message-wrapper mb-4 ai-message">
              <v-card color="grey-lighten-4" variant="outlined" class="message-card">
                <v-card-text class="pa-3">
                  <div class="d-flex align-center">
                    <v-icon color="primary" class="mr-2" size="small">mdi-robot</v-icon>
                    <div class="d-flex align-center">
                      <v-progress-circular
                        indeterminate
                        size="16"
                        width="2"
                        color="primary"
                        class="mr-2"
                      ></v-progress-circular>
                      <span class="text-body-2 text-grey-darken-1">Pensando...</span>
                    </div>
                  </div>
                </v-card-text>
              </v-card>
            </div>
          </div>
        </v-card-text>

        <!-- Input Area -->
        <v-card-actions class="input-area pa-3 bg-grey-lighten-5">
          <v-textarea
            v-model="inputMessage"
            placeholder="Digite sua pergunta..."
            variant="outlined"
            density="compact"
            rows="2"
            auto-grow
            hide-details
            :disabled="isLoading"
            @keydown.enter.exact.prevent="handleSend"
            @keydown.enter.shift.exact="inputMessage += '\n'"
          ></v-textarea>
          <v-btn
            color="primary"
            icon="mdi-send"
            :loading="isLoading"
            :disabled="!inputMessage.trim() || isLoading"
            class="ml-2"
            @click="handleSend"
          >
            <v-icon>mdi-send</v-icon>
          </v-btn>
        </v-card-actions>

        <!-- Error Message -->
        <v-alert
          v-if="error"
          type="error"
          variant="tonal"
          density="compact"
          class="ma-3"
          closable
          @click:close="error = null"
        >
          {{ error }}
        </v-alert>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/app/store/auth.store'
import { aiChatService, type ChatRequest, type ChatContext } from '@/shared/services/aiChat.service'

const authStore = useAuthStore()
const route = useRoute()

interface Message {
  role: 'user' | 'ai'
  content: string
  timestamp: Date
}

const isOpen = ref(false)
const messages = ref<Message[]>([])
const inputMessage = ref('')
const isLoading = ref(false)
const error = ref<string | null>(null)
const useContext = ref(true) // Toggle to enable/disable context

// Detect context from current route
const currentContext = computed<ChatContext | null>(() => {
  if (!useContext.value) return null

  const context: ChatContext = {}
  
  // Detect property context
  if (route.name === 'properties-details' || route.name === 'properties-edit') {
    const propertyId = route.params.id as string
    if (propertyId) {
      context.property_id = propertyId
    }
  }
  
  // Detect client context (if routes exist)
  if (route.name === 'clients-details' || route.name === 'clients-edit') {
    const clientId = route.params.id as string
    if (clientId) {
      context.client_id = clientId
    }
  }
  
  // Detect attendance context (if routes exist)
  if (route.name === 'attendances-details' || route.name === 'attendances-edit') {
    const attendanceId = route.params.id as string
    if (attendanceId) {
      context.attendance_id = attendanceId
    }
  }
  
  // Return context only if at least one ID is present
  if (context.property_id || context.client_id || context.attendance_id) {
    return context
  }
  
  return null
})

// Context description for UI
const contextDescription = computed(() => {
  if (!currentContext.value) return null
  
  const parts: string[] = []
  if (currentContext.value.property_id) {
    parts.push('Propriedade')
  }
  if (currentContext.value.client_id) {
    parts.push('Cliente')
  }
  if (currentContext.value.attendance_id) {
    parts.push('Atendimento')
  }
  
  return parts.length > 0 ? parts.join(', ') : null
})

// Suggested questions based on context
const suggestedQuestions = computed(() => {
  if (!currentContext.value) return []
  
  const suggestions: string[] = []
  
  if (currentContext.value.property_id) {
    suggestions.push('Qual o status desta propriedade?')
    suggestions.push('Quais são as características principais?')
    suggestions.push('Qual o preço desta propriedade?')
  }
  
  if (currentContext.value.client_id) {
    suggestions.push('Qual o status deste cliente?')
    suggestions.push('Qual o interesse deste cliente?')
    suggestions.push('Qual o orçamento deste cliente?')
  }
  
  if (currentContext.value.attendance_id) {
    suggestions.push('O que foi discutido neste atendimento?')
    suggestions.push('Qual o resumo deste atendimento?')
  }
  
  return suggestions.slice(0, 3) // Limit to 3 suggestions
})

const openChat = () => {
  isOpen.value = true
}

const closeChat = () => {
  isOpen.value = false
  error.value = null
}

const formatTime = (date: Date): string => {
  return new Intl.DateTimeFormat('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

const scrollToBottom = () => {
  nextTick(() => {
    const container = document.querySelector('.messages-container')
    if (container) {
      container.scrollTop = container.scrollHeight
    }
  })
}

const handleSend = async () => {
  const message = inputMessage.value.trim()
  if (!message || isLoading.value) return

  // Add user message
  const userMessage: Message = {
    role: 'user',
    content: message,
    timestamp: new Date(),
  }
  messages.value.push(userMessage)
  inputMessage.value = ''
  error.value = null
  isLoading.value = true

  scrollToBottom()

  try {
    // Prepare request with current context
    const request: ChatRequest = {
      message,
      context: currentContext.value,
    }

    // Send to API
    const response = await aiChatService.sendMessage(request)

    if (response.error) {
      throw new Error(response.error)
    }

    // Add AI response
    const aiMessage: Message = {
      role: 'ai',
      content: response.answer,
      timestamp: new Date(),
    }
    messages.value.push(aiMessage)

    scrollToBottom()
  } catch (err: any) {
    console.error('Chat error:', err)
    error.value = err.message || 'Erro ao enviar mensagem. Tente novamente.'
    
    // Add error message to chat
    const errorMessage: Message = {
      role: 'ai',
      content: `Desculpe, ocorreu um erro: ${err.message || 'Erro desconhecido'}`,
      timestamp: new Date(),
    }
    messages.value.push(errorMessage)
  } finally {
    isLoading.value = false
    scrollToBottom()
  }
}

// Watch for new messages to auto-scroll
watch(messages, () => {
  scrollToBottom()
}, { deep: true })

// Watch route changes to update context
watch(() => route.params.id, () => {
  // Context will be automatically updated via computed property
  // Optionally, you could show a notification that context changed
}, { immediate: false })

// Clear chat on logout
watch(() => authStore.isAuthenticated, (isAuthenticated) => {
  if (!isAuthenticated) {
    messages.value = []
    inputMessage.value = ''
    error.value = null
    isOpen.value = false
    useContext.value = true // Reset context toggle
  }
})

onMounted(() => {
  // Ensure chat is closed if user is not authenticated
  if (!authStore.isAuthenticated) {
    isOpen.value = false
  }
})
</script>

<style scoped>
.ai-chat-widget {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 1000;
}

.chat-button {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 1000;
}

.chat-dialog {
  height: 600px;
  display: flex;
  flex-direction: column;
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  max-height: 400px;
}

.messages-list {
  display: flex;
  flex-direction: column;
}

.message-wrapper {
  display: flex;
  width: 100%;
}

.user-message {
  justify-content: flex-end;
}

.ai-message {
  justify-content: flex-start;
}

.message-card {
  max-width: 80%;
  word-wrap: break-word;
}

.user-message .message-card {
  max-width: 80%;
}

.ai-message .message-card {
  max-width: 80%;
}

.message-content {
  min-width: 0;
}

.input-area {
  border-top: 1px solid rgba(0, 0, 0, 0.12);
}

.empty-state {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
</style>

