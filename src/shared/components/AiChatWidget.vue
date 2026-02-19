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

    <!-- Chat Dialog - Fixed Position -->
    <transition name="chat-slide">
      <v-card
        v-if="isOpen"
        class="chat-dialog"
        elevation="8"
      >
        <!-- Header -->
        <v-card-title class="d-flex align-center justify-space-between bg-primary text-white">
          <div class="d-flex align-center">
            <v-icon class="mr-2">mdi-robot</v-icon>
            <span>Assistente AI</span>
          </div>
          <div class="d-flex align-center gap-2">
            <!-- Context Toggle Button in Header -->
            <v-tooltip location="bottom" v-if="availableContext && contextDescription">
              <template #activator="{ props }">
                <v-btn
                  v-bind="props"
                  icon
                  variant="text"
                  color="white"
                  size="small"
                  :class="{ 'context-active': useContext, 'context-inactive': !useContext }"
                  @click="useContext = !useContext"
                >
                  <v-icon v-if="useContext" color="white">mdi-link</v-icon>
                  <v-icon v-else color="white" style="opacity: 0.6;">mdi-link-off</v-icon>
                </v-btn>
              </template>
              <span>{{ useContext ? 'Desativar contexto' : 'Ativar contexto' }}</span>
            </v-tooltip>
            <v-btn
              icon="mdi-close"
              variant="text"
              color="white"
              size="small"
              @click="closeChat"
            >
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </div>
        </v-card-title>
        
        <!-- Context Banner - Active -->
        <v-card
          v-if="availableContext && contextDescription && useContext"
          variant="tonal"
          color="info"
          class="mx-3 mt-3 mb-2"
        >
          <v-card-text class="pa-3">
            <div class="d-flex align-center justify-space-between">
              <div class="d-flex align-center flex-grow-1">
                <v-icon color="info" size="small" class="mr-2">mdi-information</v-icon>
                <div class="flex-grow-1">
                  <div class="text-caption font-weight-medium mb-1">
                    Contexto ativo
                  </div>
                  <div class="text-body-2">
                    Respondendo sobre: <strong>{{ contextDescription }}</strong>
                  </div>
                </div>
              </div>
              <v-btn
                icon
                size="small"
                variant="text"
                color="info"
                @click="useContext = false"
                class="ml-2"
              >
                <v-icon size="small">mdi-close</v-icon>
              </v-btn>
            </div>
          </v-card-text>
        </v-card>
        
        <!-- Context Banner - Inactive -->
        <v-card
          v-else-if="availableContext && contextDescription && !useContext"
          variant="outlined"
          color="warning"
          class="mx-3 mt-3 mb-2"
        >
          <v-card-text class="pa-3">
            <div class="d-flex align-center justify-space-between">
              <div class="d-flex align-center flex-grow-1">
                <v-icon color="warning" size="small" class="mr-2">mdi-link-off</v-icon>
                <div class="flex-grow-1">
                  <div class="text-caption font-weight-medium mb-1 text-warning">
                    Contexto disponível mas desativado
                  </div>
                  <div class="text-body-2 text-grey-darken-1">
                    Contexto: <strong>{{ contextDescription }}</strong> está disponível, mas não será usado.
                  </div>
                  <div class="text-caption text-grey mt-1">
                    Você pode fazer perguntas gerais sobre o sistema.
                  </div>
                </div>
              </div>
              <v-btn
                color="warning"
                size="small"
                variant="flat"
                prepend-icon="mdi-link"
                @click="useContext = true"
                class="ml-2"
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
            
            <!-- Context Info Card (when no messages) -->
            <v-card
              v-if="availableContext && contextDescription"
              variant="outlined"
              :color="useContext ? 'primary' : 'grey'"
              class="mt-4"
            >
              <v-card-text class="pa-3">
                <div class="d-flex align-center justify-space-between">
                  <div class="d-flex align-center flex-grow-1">
                    <v-icon 
                      :color="useContext ? 'primary' : 'grey'" 
                      size="small" 
                      class="mr-2"
                    >
                      {{ useContext ? 'mdi-link' : 'mdi-link-off' }}
                    </v-icon>
                    <div>
                      <div class="text-body-2 font-weight-medium">
                        Contexto: <strong>{{ contextDescription }}</strong>
                      </div>
                      <div class="text-caption text-grey mt-1">
                        {{ useContext ? 'O assistente usará informações deste contexto' : 'Contexto desativado - perguntas gerais' }}
                      </div>
                    </div>
                  </div>
                  <v-switch
                    v-model="useContext"
                    density="compact"
                    hide-details
                    color="primary"
                    class="ml-3"
                    :label="useContext ? 'Ativo' : 'Inativo'"
                  ></v-switch>
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
                  class="justify-start mb-2"
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
                        v-if="message.role === 'user'"
                        class="text-body-2 text-white"
                        style="white-space: pre-wrap; word-wrap: break-word;"
                      >
                        {{ message.content }}
                      </div>
                      <div
                        v-else
                        class="text-body-2 text-grey-darken-1 markdown-content"
                        v-html="formatMarkdown(message.content)"
                      ></div>
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
    </transition>
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

// Detect if user is on dashboard (for dashboard context)
const isOnDashboard = computed(() => route.name === 'dashboard')

// Detect available context from current route (independent of toggle)
const availableContext = computed<ChatContext | null>(() => {
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
  
  // Return context if at least one ID is present, or if on dashboard (dashboard has its own context)
  if (context.property_id || context.client_id || context.attendance_id) {
    return context
  }
  
  // On dashboard, return empty context (dashboard data is loaded via include_dashboard)
  if (route.name === 'dashboard') {
    return {}
  }
  
  return null
})

// Whether to include dashboard data (when on dashboard page)
const shouldIncludeDashboard = computed(() => 
  useContext.value && isOnDashboard.value
)

// Context that will be sent to API (depends on toggle)
const currentContext = computed<ChatContext | null>(() => {
  if (!useContext.value || !availableContext.value) return null
  return availableContext.value
})

// Context description for UI (based on available context, not sent context)
const contextDescription = computed(() => {
  const parts: string[] = []
  if (availableContext.value) {
    if (availableContext.value.property_id) parts.push('Propriedade')
    if (availableContext.value.client_id) parts.push('Cliente')
    if (availableContext.value.attendance_id) parts.push('Atendimento')
  }
  if (isOnDashboard.value) {
    parts.push('Dashboard')
  }
  return parts.length > 0 ? parts.join(', ') : null
})

// Suggested questions based on available context
const suggestedQuestions = computed(() => {
  const suggestions: string[] = []
  
  if (isOnDashboard.value) {
    suggestions.push('Resuma as principais métricas da dashboard')
    suggestions.push('Quais oportunidades merecem atenção imediata?')
    suggestions.push('Como está a performance dos corretores?')
    suggestions.push('Quais clientes estão em risco?')
  }
  
  if (availableContext.value) {
    if (availableContext.value.property_id) {
      suggestions.push('Qual o status desta propriedade?')
      suggestions.push('Quais são as características principais?')
      suggestions.push('Qual o preço desta propriedade?')
    }
    if (availableContext.value.client_id) {
      suggestions.push('Qual o status deste cliente?')
      suggestions.push('Qual o interesse deste cliente?')
      suggestions.push('Qual o orçamento deste cliente?')
    }
    if (availableContext.value.attendance_id) {
      suggestions.push('Me dê um resumo completo deste atendimento com todo o contexto')
      suggestions.push('Qual o estado atual do atendimento e do imóvel vinculado?')
      suggestions.push('Teve venda ou perda? Tem visita agendada?')
      suggestions.push('Quais os próximos passos sugeridos pela IA?')
    }
  }
  
  return suggestions.slice(0, 4) // Limit to 4 suggestions
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

const formatMarkdown = (text: string): string => {
  if (!text) return ''
  
  // Simple markdown parser for common formatting
  let html = text
  
  // Headers
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>')
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>')
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>')
  
  // Bold
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  html = html.replace(/__(.+?)__/g, '<strong>$1</strong>')
  
  // Italic
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>')
  html = html.replace(/_(.+?)_/g, '<em>$1</em>')
  
  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code class="markdown-code">$1</code>')
  
  // Code blocks
  html = html.replace(/```([\s\S]*?)```/g, '<pre class="markdown-pre"><code>$1</code></pre>')
  
  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
  
  // Lists - unordered
  html = html.replace(/^[\*\-] (.+)$/gim, '<li>$1</li>')
  html = html.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
  
  // Lists - ordered
  html = html.replace(/^\d+\. (.+)$/gim, '<li>$1</li>')
  
  // Line breaks
  html = html.replace(/\n\n/g, '</p><p>')
  html = html.replace(/\n/g, '<br>')
  
  // Wrap in paragraph if not already wrapped
  if (!html.startsWith('<')) {
    html = '<p>' + html + '</p>'
  }
  
  return html
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
    // Prepare request with current context and dashboard data when on dashboard
    const request: ChatRequest = {
      message,
      context: currentContext.value,
      include_dashboard: shouldIncludeDashboard.value,
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
  position: fixed !important;
  bottom: 0px !important;
  right: 24px !important;
  width: 500px !important;
  max-width: calc(100vw - 48px) !important;
  height: calc(100vh - 150px) !important;
  max-height: calc(100vh - 150px) !important;
  display: flex;
  flex-direction: column;
  margin: 0 !important;
  border-radius: 16px 16px 0 0;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3) !important;
  z-index: 1001 !important;
  overflow: hidden;
}

/* Ensure card sections don't get cut off */
.chat-dialog :deep(.v-card-title) {
  flex-shrink: 0;
  min-height: 64px;
}

.chat-dialog :deep(.v-card-actions) {
  flex-shrink: 0;
}

/* Ensure card sections don't get cut off */
.chat-dialog :deep(.v-card-title) {
  flex-shrink: 0;
  min-height: 64px;
}

.chat-dialog :deep(.v-card-actions) {
  flex-shrink: 0;
}

.chat-dialog :deep(.v-card-text.messages-container) {
  overflow-y: auto !important;
  overflow-x: hidden !important;
  flex: 1 !important;
  min-height: 0 !important;
  display: flex !important;
  flex-direction: column !important;
}

.chat-dialog :deep(.v-card-text) {
  overflow: visible;
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  min-height: 0;
  display: flex;
  flex-direction: column;
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

/* Chat slide animation */
.chat-slide-enter-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.chat-slide-leave-active {
  transition: all 0.25s cubic-bezier(0.4, 0, 1, 1);
}

.chat-slide-enter-from {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
}

.chat-slide-leave-to {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
}

.chat-slide-enter-to,
.chat-slide-leave-from {
  opacity: 1;
  transform: translateY(0) scale(1);
}

.context-active {
  background-color: rgba(255, 255, 255, 0.2) !important;
}

.context-inactive {
  opacity: 0.7;
}

/* Markdown styling */
.markdown-content {
  line-height: 1.6;
}

.markdown-content :deep(h1) {
  font-size: 1.5rem;
  font-weight: bold;
  margin: 1rem 0 0.5rem 0;
  color: inherit;
}

.markdown-content :deep(h2) {
  font-size: 1.25rem;
  font-weight: bold;
  margin: 0.875rem 0 0.5rem 0;
  color: inherit;
}

.markdown-content :deep(h3) {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0.75rem 0 0.5rem 0;
  color: inherit;
}

.markdown-content :deep(p) {
  margin: 0.5rem 0;
}

.markdown-content :deep(ul),
.markdown-content :deep(ol) {
  margin: 0.5rem 0;
  padding-left: 1.5rem;
}

.markdown-content :deep(li) {
  margin: 0.25rem 0;
}

.markdown-content :deep(strong) {
  font-weight: 600;
  color: inherit;
}

.markdown-content :deep(em) {
  font-style: italic;
}

.markdown-content :deep(code) {
  background-color: rgba(0, 0, 0, 0.1);
  padding: 0.125rem 0.25rem;
  border-radius: 0.25rem;
  font-family: 'Courier New', monospace;
  font-size: 0.9em;
}

.markdown-content :deep(pre) {
  background-color: rgba(0, 0, 0, 0.1);
  padding: 0.75rem;
  border-radius: 0.5rem;
  overflow-x: auto;
  margin: 0.75rem 0;
}

.markdown-content :deep(pre code) {
  background-color: transparent;
  padding: 0;
}

.markdown-content :deep(a) {
  color: inherit;
  text-decoration: underline;
  opacity: 0.9;
}

.markdown-content :deep(a:hover) {
  opacity: 1;
}
</style>

