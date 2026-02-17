<template>
  <div>
    <!-- Header -->
    <div class="d-flex align-center justify-space-between mb-4">
      <div class="d-flex align-center">
        <v-icon class="mr-2" color="primary" size="24">mdi-target</v-icon>
        <h3 class="text-h6 font-weight-bold">Ciclos de Atendimento</h3>
      </div>
      <v-btn
        color="primary"
        size="small"
        prepend-icon="mdi-plus"
        @click="handleCreateAttendance"
      >
        Novo Atendimento
      </v-btn>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="d-flex justify-center pa-8">
      <v-progress-circular indeterminate color="primary"></v-progress-circular>
    </div>

    <!-- Empty State -->
    <v-card v-else-if="attendances.length === 0" variant="outlined" class="text-center pa-8">
      <v-icon size="64" color="grey-lighten-1" class="mb-4">mdi-target-variant</v-icon>
      <div class="text-h6 text-medium-emphasis mb-2">Nenhum ciclo de atendimento</div>
      <div class="text-body-2 text-medium-emphasis mb-4">
        Os ciclos de atendimento deste cliente aparecerão aqui quando forem criados.
      </div>
      <v-btn color="primary" prepend-icon="mdi-plus" @click="handleCreateAttendance">
        Criar Primeiro Atendimento
      </v-btn>
    </v-card>

    <!-- Cycles Timeline -->
    <div v-else class="cycles-timeline">
      <v-expansion-panels
        v-model="expandedCycles"
        variant="accordion"
        multiple
      >
        <v-expansion-panel
          v-for="(attendance, index) in sortedAttendances"
          :key="attendance.id"
          :value="attendance.id"
          class="cycle-panel"
        >
          <template #title>
            <div class="d-flex align-center flex-grow-1">
              <!-- Timeline Connector -->
              <div class="timeline-connector mr-4">
                <v-avatar
                  :color="getStatusColor(attendance.status)"
                  size="40"
                  class="timeline-dot"
                >
                  <v-icon color="white" size="20">
                    {{ getStatusIcon(attendance.status) }}
                  </v-icon>
                </v-avatar>
                <div
                  v-if="index < sortedAttendances.length - 1"
                  class="timeline-line"
                ></div>
              </div>

              <!-- Cycle Info -->
              <div class="flex-grow-1">
                <div class="d-flex align-center mb-1">
                  <v-chip
                    :color="getStatusColor(attendance.status)"
                    variant="flat"
                    size="small"
                    class="mr-2"
                  >
                    {{ getStatusLabel(attendance.status) }}
                  </v-chip>
                  <span class="text-caption text-medium-emphasis">
                    {{ formatDateTime(attendance.created_at) }}
                  </span>
                </div>
                <div class="text-body-1 font-weight-medium">
                  {{ attendance.objective || 'Objetivo não definido' }}
                </div>
                <div v-if="attendance.status === 'COMPLETED' || attendance.status === 'LOST' || attendance.status === 'ABANDONED'" class="text-caption text-medium-emphasis">
                  Finalizado em {{ formatDateTime(attendance.updated_at) }}
                </div>
              </div>

              <!-- Active Badge -->
              <v-chip
                v-if="attendance.status === 'ACTIVE'"
                color="success"
                variant="flat"
                size="small"
                class="ml-2"
              >
                <v-icon start size="14">mdi-sync</v-icon>
                Ativo
              </v-chip>
            </div>
          </template>

          <template #text>
            <div class="cycle-details pa-6">
              <!-- Objective - Main Title -->
              <div v-if="attendance.objective" class="mb-6">
                <h3 class="text-h6 font-weight-medium mb-2">
                  {{ attendance.objective }}
                </h3>
              </div>

              <!-- Attendance Info Grid -->
              <div class="mb-6">
                <h4 class="text-subtitle-2 font-weight-medium text-medium-emphasis mb-3">
                  Informações do Atendimento
                </h4>
                <v-row dense>
                  <v-col cols="12" sm="6">
                    <div class="info-field">
                      <div class="text-caption text-medium-emphasis mb-1">Agente Responsável</div>
                      <div class="text-body-2 font-weight-medium">
                        {{ getAgentName(attendance.agent_id) }}
                      </div>
                    </div>
                  </v-col>
                  <v-col cols="12" sm="6">
                    <div class="info-field">
                      <div class="text-caption text-medium-emphasis mb-1">Criado em</div>
                      <div class="text-body-2 font-weight-medium">
                        {{ formatDateTime(attendance.created_at) }}
                      </div>
                    </div>
                  </v-col>
                  <v-col cols="12" sm="6" v-if="attendance.status !== 'ACTIVE'">
                    <div class="info-field">
                      <div class="text-caption text-medium-emphasis mb-1">Finalizado em</div>
                      <div class="text-body-2 font-weight-medium">
                        {{ formatDateTime(attendance.updated_at) }}
                      </div>
                    </div>
                  </v-col>
                </v-row>
              </div>

              <!-- Conversations Timeline -->
              <div v-if="attendance.raw_content" class="mb-6">
                <h4 class="text-subtitle-2 font-weight-medium text-medium-emphasis mb-3">
                  <v-icon size="18" class="mr-2">mdi-message-text-outline</v-icon>
                  Conversas do Ciclo
                </h4>
                <div class="conversations-timeline">
                  <template v-for="(conversation, index) in parseConversations(attendance.raw_content)" :key="index">
                    <div class="conversation-item">
                      <div class="d-flex align-start">
                        <v-icon size="16" color="primary" class="mr-3 mt-1">mdi-circle-small</v-icon>
                        <div class="flex-grow-1">
                          <div class="text-caption text-disabled mb-1">
                            {{ conversation.timestamp }}
                          </div>
                          <div class="text-body-2 conversation-text">
                            {{ conversation.content }}
                          </div>
                        </div>
                      </div>
                      <v-divider v-if="index < parseConversations(attendance.raw_content).length - 1" class="my-3" />
                    </div>
                  </template>
                </div>
              </div>

              <!-- AI Summary -->
              <div v-if="attendance.ai_summary" class="mb-6">
                <h4 class="text-subtitle-2 font-weight-medium text-medium-emphasis mb-3">
                  <v-icon size="18" class="mr-2" color="primary">mdi-robot</v-icon>
                  Resumo da IA
                </h4>
                <div 
                  class="ai-summary-content markdown-content" 
                  v-html="formatMarkdown(attendance.ai_summary)"
                ></div>
              </div>

              <!-- AI Next Steps -->
              <div v-if="attendance.ai_next_steps" class="mb-6">
                <h4 class="text-subtitle-2 font-weight-medium text-medium-emphasis mb-3">
                  <v-icon size="18" class="mr-2" color="info">mdi-arrow-right-circle</v-icon>
                  Próximos Passos
                </h4>
                <v-list variant="flat" density="comfortable" class="pa-0">
                  <template v-for="(step, index) in parseNextSteps(attendance.ai_next_steps)" :key="index">
                    <v-list-item class="px-0 py-2">
                      <template #prepend>
                        <v-icon 
                          :color="step.isUrgent ? 'error' : step.isHighPriority ? 'warning' : 'primary'" 
                          size="18" 
                          class="mr-3"
                        >
                          {{ step.isUrgent ? 'mdi-alert-circle' : step.isHighPriority ? 'mdi-clock-alert' : 'mdi-arrow-right' }}
                        </v-icon>
                      </template>
                      <v-list-item-title class="d-flex align-center flex-wrap ga-2">
                        <span :class="step.isUrgent ? 'font-weight-medium' : 'text-body-2'">
                          {{ step.text }}
                        </span>
                        <v-chip
                          v-if="step.priority"
                          :color="getPriorityColor(step.priority)"
                          variant="tonal"
                          size="x-small"
                          class="ml-2"
                        >
                          {{ step.priority }}
                        </v-chip>
                      </v-list-item-title>
                    </v-list-item>
                    <v-divider v-if="index < parseNextSteps(attendance.ai_next_steps).length - 1" class="my-1" />
                  </template>
                </v-list>
              </div>

              <!-- Actions -->
              <v-divider class="my-4" />
              <div class="d-flex ga-2 flex-wrap">
                <v-btn
                  color="primary"
                  variant="text"
                  size="small"
                  prepend-icon="mdi-eye"
                  @click="handleViewDetails(attendance.id)"
                >
                  Ver Detalhes
                </v-btn>
                <v-btn
                  v-if="attendance.status === 'ACTIVE'"
                  color="success"
                  variant="text"
                  size="small"
                  prepend-icon="mdi-message-plus"
                  @click="handleAddConversation(attendance.id)"
                >
                  Adicionar Conversa
                </v-btn>
                <v-btn
                  v-if="attendance.status === 'ACTIVE'"
                  color="primary"
                  variant="text"
                  size="small"
                  prepend-icon="mdi-check-circle"
                  @click="handleCompleteCycle(attendance.id)"
                >
                  Finalizar Ciclo
                </v-btn>
              </div>
            </div>
          </template>
        </v-expansion-panel>
      </v-expansion-panels>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  attendancesService,
  type Attendance,
  type AttendanceStatus,
} from '@/shared/services/attendances.service'
import { usersService, type User } from '@/shared/services/users.service'

interface Props {
  clientId: string
}

const props = defineProps<Props>()
const router = useRouter()

// State
const isLoading = ref(false)
const attendances = ref<Attendance[]>([])
const agents = ref<User[]>([])
const expandedCycles = ref<string[]>([])

// Computed
const sortedAttendances = computed(() => {
  // Sort by created_at descending (most recent first)
  return [...attendances.value].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )
})

const agentsMap = computed(() => {
  const map = new Map<string, User>()
  agents.value.forEach(agent => map.set(agent.id, agent))
  return map
})

// Methods
const loadAttendances = async () => {
  isLoading.value = true
  try {
    attendances.value = await attendancesService.getAttendances({
      client_id: props.clientId,
      limit: 1000,
    })
    
    // Auto-expand active cycles
    const activeCycles = attendances.value
      .filter(a => a.status === 'ACTIVE')
      .map(a => a.id)
    if (activeCycles.length > 0) {
      expandedCycles.value = activeCycles
    }
  } catch (error) {
    console.error('Error loading attendances:', error)
    attendances.value = []
  } finally {
    isLoading.value = false
  }
}

const loadAgents = async () => {
  try {
    agents.value = await usersService.getCorretores()
  } catch (error) {
    console.error('Error loading agents:', error)
  }
}

const getAgentName = (agentId: string): string => {
  const agent = agentsMap.value.get(agentId)
  return agent?.full_name || `Agente #${agentId.slice(0, 8)}`
}

// Status helpers
const getStatusLabel = (status: AttendanceStatus): string => {
  const labels: Record<AttendanceStatus, string> = {
    ACTIVE: 'Ativo',
    COMPLETED: 'Concluído',
    LOST: 'Perdido',
    ABANDONED: 'Abandonado',
  }
  return labels[status] || status
}

const getStatusColor = (status: AttendanceStatus): string => {
  const colors: Record<AttendanceStatus, string> = {
    ACTIVE: 'success',
    COMPLETED: 'primary',
    LOST: 'error',
    ABANDONED: 'warning',
  }
  return colors[status] || 'grey'
}

const getStatusIcon = (status: AttendanceStatus): string => {
  const icons: Record<AttendanceStatus, string> = {
    ACTIVE: 'mdi-check-circle',
    COMPLETED: 'mdi-check-circle',
    LOST: 'mdi-close-circle',
    ABANDONED: 'mdi-pause-circle',
  }
  return icons[status] || 'mdi-help-circle'
}

// Formatting helpers
const formatDateTime = (dateString: string | null | undefined): string => {
  if (!dateString) return 'Data não disponível'
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return 'Data inválida'
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/Sao_Paulo', // Explicitly use Brazil timezone
  }).format(date)
}

const formatDuration = (seconds: number): string => {
  if (seconds < 60) {
    return `${seconds}s`
  }
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  if (minutes < 60) {
    return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`
  }
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`
}

// Parse conversations from raw_content
const parseConversations = (rawContent: string): Array<{ timestamp: string; content: string }> => {
  if (!rawContent) return []
  
  const conversations: Array<{ timestamp: string; content: string }> = []
  const lines = rawContent.split('\n')
  
  let currentConversation: { timestamp: string; content: string } | null = null
  
  for (const line of lines) {
    // Check for timestamp patterns:
    // [YYYY-MM-DD HH:MM:SS]
    // [YYYY-MM-DD HH:MM]
    // --- [timestamp]
    const timestampMatch = line.match(/\[(\d{4}-\d{2}-\d{2}[\s\d:]+)\]/) || 
                          line.match(/---\s*\[(\d{4}-\d{2}-\d{2}[\s\d:]+)\]/)
    
    if (timestampMatch) {
      // Save previous conversation if exists
      if (currentConversation && currentConversation.content.trim()) {
        conversations.push(currentConversation)
      }
      
      // Create new conversation
      try {
        const timestamp = new Date(timestampMatch[1])
        const formattedTimestamp = isNaN(timestamp.getTime()) 
          ? timestampMatch[1] 
          : formatDateTime(timestamp.toISOString())
        
        currentConversation = {
          timestamp: formattedTimestamp,
          content: line.replace(timestampMatch[0], '').trim(),
        }
      } catch (e) {
        // If date parsing fails, use the raw timestamp
        currentConversation = {
          timestamp: timestampMatch[1],
          content: line.replace(timestampMatch[0], '').trim(),
        }
      }
    } else if (currentConversation) {
      // Append to current conversation
      const trimmedLine = line.trim()
      if (trimmedLine) {
        currentConversation.content += (currentConversation.content ? '\n' : '') + trimmedLine
      }
    }
  }
  
  // Add last conversation
  if (currentConversation && currentConversation.content.trim()) {
    conversations.push(currentConversation)
  }
  
  // If no conversations were parsed (no timestamps found), return the whole content as one
  if (conversations.length === 0) {
    conversations.push({
      timestamp: 'Conversa',
      content: rawContent.trim(),
    })
  }
  
  return conversations
}

// Parse next steps
const parseNextSteps = (nextSteps: string): Array<{ text: string; priority: string | null; isUrgent: boolean; isHighPriority: boolean }> => {
  if (!nextSteps) return []
  
  const steps: Array<{ text: string; priority: string | null; isUrgent: boolean; isHighPriority: boolean }> = []
  const lines = nextSteps.split('\n')
  
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) continue
    
    // Remove bullet points and numbering
    let cleanText = trimmed
      .replace(/^[-*•]\s*/, '')
      .replace(/^\d+\.\s*/, '')
      .trim()
    
    if (!cleanText) continue
    
    // Extract priority from text (check for patterns like "Alta prioridade - Contatar em até 24h")
    let priority: string | null = null
    let isUrgent = false
    let isHighPriority = false
    
    // Check for explicit priority patterns
    const urgentMatch = cleanText.match(/(?:URGENTE|urgente|Imediata|imediata|imediato|24h|hoje|agora)/i)
    const highMatch = cleanText.match(/(?:Alta prioridade|Alta|alta)/i)
    const mediumMatch = cleanText.match(/(?:Média prioridade|Média|média)/i)
    const lowMatch = cleanText.match(/(?:Baixa prioridade|Baixa|baixa)/i)
    
    if (urgentMatch) {
      priority = 'Urgente'
      isUrgent = true
      // Remove priority text from content
      cleanText = cleanText
        .replace(/\(?\s*urgente\s*\)?/gi, '')
        .replace(/\(?\s*imediata\s*\)?/gi, '')
        .replace(/\(?\s*imediato\s*\)?/gi, '')
        .replace(/\(?\s*24h\s*\)?/gi, '')
        .trim()
    } else if (highMatch) {
      priority = 'Alta'
      isHighPriority = true
      cleanText = cleanText.replace(/\(?\s*alta prioridade\s*\)?/gi, '').trim()
    } else if (mediumMatch) {
      priority = 'Média'
      cleanText = cleanText.replace(/\(?\s*média prioridade\s*\)?/gi, '').trim()
    } else if (lowMatch) {
      priority = 'Baixa'
      cleanText = cleanText.replace(/\(?\s*baixa prioridade\s*\)?/gi, '').trim()
    }
    
    // Clean up any remaining separators
    cleanText = cleanText.replace(/^[-–—]\s*/, '').trim()
    
    steps.push({
      text: cleanText,
      priority,
      isUrgent,
      isHighPriority,
    })
  }
  
  return steps
}

// Get priority color
const getPriorityColor = (priority: string): string => {
  const colors: Record<string, string> = {
    'Urgente': 'error',
    'Alta': 'warning',
    'Média': 'info',
    'Baixa': 'grey',
  }
  return colors[priority] || 'grey'
}

// Format markdown
const formatMarkdown = (text: string): string => {
  if (!text) return ''
  
  let html = text
  
  // Code blocks first (to avoid processing markdown inside code)
  html = html.replace(/```([\s\S]*?)```/g, '<pre class="markdown-pre"><code>$1</code></pre>')
  
  // Headers
  html = html.replace(/^### (.*$)/gim, '<h3 class="text-subtitle-1 font-weight-bold mt-4 mb-2">$1</h3>')
  html = html.replace(/^## (.*$)/gim, '<h2 class="text-h6 font-weight-bold mt-4 mb-2">$1</h2>')
  html = html.replace(/^# (.*$)/gim, '<h1 class="text-h5 font-weight-bold mt-4 mb-3">$1</h1>')
  
  // Bold
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong class="font-weight-medium">$1</strong>')
  html = html.replace(/__(.+?)__/g, '<strong class="font-weight-medium">$1</strong>')
  
  // Italic (avoid conflicts with bold)
  html = html.replace(/(?<!\*)\*(?!\*)([^*]+?)(?<!\*)\*(?!\*)/g, '<em>$1</em>')
  html = html.replace(/(?<!_)_(?!_)([^_]+?)(?<!_)_(?!_)/g, '<em>$1</em>')
  
  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code class="markdown-code">$1</code>')
  
  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-primary">$1</a>')
  
  // Lists - process line by line
  const lines = html.split('\n')
  const processedLines: string[] = []
  let inList = false
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const unorderedMatch = line.match(/^[\*\-] (.+)$/)
    const orderedMatch = line.match(/^\d+\. (.+)$/)
    
    if (unorderedMatch || orderedMatch) {
      if (!inList) {
        processedLines.push('<ul class="markdown-list">')
        inList = true
      }
      processedLines.push(`<li>${unorderedMatch ? unorderedMatch[1] : orderedMatch![1]}</li>`)
    } else {
      if (inList) {
        processedLines.push('</ul>')
        inList = false
      }
      processedLines.push(line)
    }
  }
  
  if (inList) {
    processedLines.push('</ul>')
  }
  
  html = processedLines.join('\n')
  
  // Line breaks - double newline becomes paragraph break
  html = html.replace(/\n\n+/g, '</p><p class="mb-2">')
  html = html.replace(/\n/g, '<br>')
  
  // Wrap in paragraph if not already wrapped
  if (!html.trim().startsWith('<')) {
    html = '<p class="mb-2">' + html + '</p>'
  }
  
  return html
}

// Actions
const handleCreateAttendance = () => {
  router.push({
    name: 'attendances-create',
    query: { client_id: props.clientId },
  })
}

const handleViewDetails = (attendanceId: string) => {
  router.push({
    name: 'attendances-details',
    params: { id: attendanceId },
  })
}

const handleAddConversation = async (attendanceId: string) => {
  // Navigate to details page where user can add conversation
  // The details page will handle showing feedback
  router.push({
    name: 'attendances-details',
    params: { id: attendanceId },
    query: { action: 'add_conversation' },
  })
}

const handleCompleteCycle = async (attendanceId: string) => {
  try {
    await attendancesService.updateAttendance(attendanceId, {
      status: 'COMPLETED',
      // ended_at removed - use updated_at instead
    })
    // Reload attendances
    await loadAttendances()
  } catch (error) {
    console.error('Error completing cycle:', error)
    alert('Erro ao finalizar ciclo')
  }
}

// Lifecycle
onMounted(async () => {
  await Promise.all([loadAttendances(), loadAgents()])
})
</script>

<style scoped>
.cycles-timeline {
  position: relative;
}

.timeline-connector {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 40px;
}

.timeline-dot {
  position: relative;
  z-index: 2;
}

.timeline-line {
  position: absolute;
  top: 40px;
  left: 50%;
  transform: translateX(-50%);
  width: 2px;
  height: calc(100% - 40px);
  background: linear-gradient(
    to bottom,
    rgba(var(--v-theme-primary), 0.3),
    rgba(var(--v-theme-primary), 0.1)
  );
  z-index: 1;
}

.cycle-panel {
  margin-bottom: 8px;
}

.cycle-details {
  background: transparent;
}

.info-field {
  padding-bottom: 0.5rem;
}

.conversations-timeline {
  position: relative;
}

.conversation-item {
  position: relative;
}

.conversation-text {
  line-height: 1.7;
  white-space: pre-wrap;
  word-wrap: break-word;
}

/* Markdown Content Styles */
.markdown-content {
  line-height: 1.7;
  color: rgba(var(--v-theme-on-surface), 0.87);
}

.markdown-content :deep(h1),
.markdown-content :deep(h2),
.markdown-content :deep(h3) {
  color: rgba(var(--v-theme-on-surface), 0.87);
  margin-top: 1.5rem;
  margin-bottom: 0.75rem;
  font-weight: 600;
}

.markdown-content :deep(h1) {
  font-size: 1.25rem;
}

.markdown-content :deep(h2) {
  font-size: 1.125rem;
}

.markdown-content :deep(h3) {
  font-size: 1rem;
}

.markdown-content :deep(p) {
  margin: 0.75rem 0;
  line-height: 1.7;
}

.markdown-content :deep(ul),
.markdown-content :deep(ol) {
  margin: 0.75rem 0;
  padding-left: 1.5rem;
}

.markdown-content :deep(li) {
  margin: 0.5rem 0;
  line-height: 1.6;
}

.markdown-content :deep(strong) {
  font-weight: 600;
  color: rgba(var(--v-theme-on-surface), 0.95);
}

.markdown-content :deep(em) {
  font-style: italic;
}

.markdown-content :deep(code) {
  background-color: rgba(var(--v-theme-surface-variant), 0.3);
  padding: 0.15rem 0.35rem;
  border-radius: 0.25rem;
  font-family: 'Courier New', monospace;
  font-size: 0.875em;
  color: rgba(var(--v-theme-on-surface), 0.87);
}

.markdown-content :deep(pre) {
  background-color: rgba(var(--v-theme-surface-variant), 0.2);
  padding: 1rem;
  border-radius: 0.5rem;
  overflow-x: auto;
  margin: 1rem 0;
}

.markdown-content :deep(pre code) {
  background-color: transparent;
  padding: 0;
  color: inherit;
}

.markdown-content :deep(a) {
  color: rgb(var(--v-theme-primary));
  text-decoration: none;
  font-weight: 500;
}

.markdown-content :deep(a:hover) {
  text-decoration: underline;
}

.ai-summary-content {
  padding: 0;
}
</style>

