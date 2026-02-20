/**
 * Dashboard Service
 * Aggregates data from multiple endpoints for dashboard visualization
 */

import { clientsService, type Client } from './clients.service'
import { salesService, type SaleStats } from './sales.service'
import { lossesService, type LossStats } from './losses.service'
import { attendancesService } from './attendances.service'
import { visitsService } from './visits.service'
import { propertiesService } from './properties.service'
import { usersService } from './users.service'

export interface DashboardMetrics {
  // Client Metrics
  total_clients: number
  active_leads: number
  won_clients: number
  lost_clients: number
  clients_by_status: Record<string, number>
  clients_by_source: Record<string, number>
  avg_lead_score: number
  
  // Sales Metrics
  sales_stats: SaleStats
  conversion_rate: number
  
  // Loss Metrics
  loss_stats: LossStats
  loss_rate: number
  
  // Activity Metrics
  total_attendances: number
  total_visits: number
  upcoming_visits: number
  total_properties: number
  available_properties: number
  
  // Funnel Data
  funnel_data: FunnelData[]
  
  // Trends (last 6 months)
  monthly_trends: MonthlyTrend[]
  
  // Broker Performance
  broker_performance: BrokerPerformance[]
  
  // Insights
  insights: DashboardInsights
}

export interface FunnelData {
  stage: string
  label: string
  count: number
  percentage: number
  color: string
  icon: string
}

export interface MonthlyTrend {
  month: string
  clients: number
  sales: number
  losses: number
  revenue: number
}

export interface BrokerPerformance {
  broker_id: string
  broker_name: string
  total_sales: number
  total_revenue: number
  total_commission: number
  conversion_rate: number
  active_clients: number
}

export interface DashboardInsights {
  top_opportunities: Client[]
  at_risk_clients: Client[]
  high_value_leads: Client[]
  recommendations: string[]
  alerts: Alert[]
}

export interface Alert {
  type: 'warning' | 'info' | 'success' | 'error'
  title: string
  message: string
  action_url?: string
}

class DashboardService {
  /**
   * Get comprehensive dashboard metrics
   */
  async getDashboardMetrics(_startDate?: string, _endDate?: string): Promise<DashboardMetrics> {
    try {
      // Fetch all data in parallel
      const [
        clients,
        salesStats,
        lossStats,
        attendances,
        visits,
        properties,
        corretores,
        allSales,
        allLosses
      ] = await Promise.all([
        clientsService.getClients({ limit: 1000 }),
        salesService.getStats(),
        lossesService.getStats(),
        attendancesService.getAttendances({ limit: 1000 }),
        visitsService.getVisits({ limit: 1000 }),
        propertiesService.listProperties({ limit: 1000 }),
        usersService.getCorretores(),
        salesService.listSales({ limit: 1000 }), // Get all sales for monthly trends
        lossesService.listLosses({ limit: 1000 }) // Get all losses for monthly trends
      ])

      // Calculate client metrics
      const totalClients = clients.length
      const activeLeads = clients.filter(c => 
        c.current_status && 
        !['WON', 'LOST', 'INACTIVE'].includes(c.current_status)
      ).length
      const wonClients = clients.filter(c => c.current_status === 'WON').length
      const lostClients = clients.filter(c => c.current_status === 'LOST').length
      
      // Clients by status
      const clientsByStatus: Record<string, number> = {}
      clients.forEach(client => {
        const status = client.current_status || 'NO_STATUS'
        clientsByStatus[status] = (clientsByStatus[status] || 0) + 1
      })
      
      // Clients by source
      const clientsBySource: Record<string, number> = {}
      clients.forEach(client => {
        const source = client.lead_source
        clientsBySource[source] = (clientsBySource[source] || 0) + 1
      })
      
      // Average lead score
      const scores = clients
        .map(c => c.current_lead_score)
        .filter((s): s is number => s !== null && s !== undefined)
      const avgLeadScore = scores.length > 0
        ? scores.reduce((a, b) => a + b, 0) / scores.length
        : 0
      
      // Activity metrics
      const totalAttendances = attendances.length
      const totalVisits = visits.length
      
      // Conversion rate = vendas concluídas / total de atendimentos
      const conversionRate = totalAttendances > 0
        ? (salesStats.completed_count / totalAttendances) * 100
        : 0
      
      // Loss rate
      const lossRate = totalClients > 0
        ? (lostClients / totalClients) * 100
        : 0
      const now = new Date()
      const pendingStatuses = ['SCHEDULED', 'CONFIRMED', 'IN_PROGRESS']
      const upcomingVisits = visits.filter(v => {
        if (!v.scheduled_at) return false
        if (!pendingStatuses.includes(v.status || '')) return false
        const scheduled = new Date(v.scheduled_at)
        return scheduled >= now && scheduled <= new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
      }).length
      
      
      const totalProperties = properties.length
      const availableProperties = properties.filter(p => 
        p.status === 'PUBLISHED'
      ).length
      
      // Funnel data
      const funnelData = this.calculateFunnelData(clients)
      
      // Monthly trends (last 6 months)
      const monthlyTrends = this.calculateMonthlyTrends(clients, allSales, allLosses)
      
      // Broker performance
      const brokerPerformance = await this.calculateBrokerPerformance(
        corretores,
        allSales,
        attendances
      )
      
      // Insights
      const insights = this.calculateInsights(clients, attendances, visits)
      
      return {
        total_clients: totalClients,
        active_leads: activeLeads,
        won_clients: wonClients,
        lost_clients: lostClients,
        clients_by_status: clientsByStatus,
        clients_by_source: clientsBySource,
        avg_lead_score: Math.round(avgLeadScore),
        sales_stats: salesStats,
        conversion_rate: Math.round(conversionRate * 100) / 100,
        loss_stats: lossStats,
        loss_rate: Math.round(lossRate * 100) / 100,
        total_attendances: totalAttendances,
        total_visits: totalVisits,
        upcoming_visits: upcomingVisits,
        total_properties: totalProperties,
        available_properties: availableProperties,
        funnel_data: funnelData,
        monthly_trends: monthlyTrends,
        broker_performance: brokerPerformance,
        insights,
      }
    } catch (error) {
      console.error('Error fetching dashboard metrics:', error)
      throw error
    }
  }
  
  private calculateFunnelData(clients: Client[]): FunnelData[] {
    const stages = [
      { key: 'NEW_LEAD', label: 'Novo Lead', color: 'grey', icon: 'mdi-account-plus' },
      { key: 'CONTACTED', label: 'Contatado', color: 'blue', icon: 'mdi-phone' },
      { key: 'QUALIFIED', label: 'Qualificado', color: 'cyan', icon: 'mdi-check-circle' },
      { key: 'VISIT_SCHEDULED', label: 'Visita Agendada', color: 'teal', icon: 'mdi-calendar-clock' },
      { key: 'VISITING', label: 'Em Visita', color: 'green', icon: 'mdi-home-search' },
      { key: 'PROPOSAL_SENT', label: 'Proposta Enviada', color: 'orange', icon: 'mdi-file-send' },
      { key: 'NEGOTIATING', label: 'Negociando', color: 'deep-orange', icon: 'mdi-handshake' },
      { key: 'WON', label: 'Ganho', color: 'success', icon: 'mdi-trophy' },
      { key: 'LOST', label: 'Perdido', color: 'error', icon: 'mdi-close-circle' },
    ]
    
    const total = clients.length
    if (total === 0) return []
    
    return stages.map(stage => {
      const count = clients.filter(c => c.current_status === stage.key).length
      const percentage = total > 0 ? (count / total) * 100 : 0
      
      return {
        stage: stage.key,
        label: stage.label,
        count,
        percentage: Math.round(percentage * 100) / 100,
        color: stage.color,
        icon: stage.icon,
      }
    }).filter(stage => stage.count > 0)
  }
  
  private calculateMonthlyTrends(
    clients: Client[], 
    sales: any[], 
    losses: any[]
  ): MonthlyTrend[] {
    const months: MonthlyTrend[] = []
    const now = new Date()
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1)
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59)
      
      // Clients created in this month
      const monthClients = clients.filter(c => {
        const created = new Date(c.created_at)
        return created >= monthStart && created <= monthEnd
      }).length
      
      // Sales completed in this month
      const monthSales = sales.filter(s => {
        if (!s.completion_date && !s.created_at) return false
        const saleDate = s.completion_date ? new Date(s.completion_date) : new Date(s.created_at)
        return saleDate >= monthStart && saleDate <= monthEnd && s.status === 'COMPLETED'
      })
      const monthSalesCount = monthSales.length
      const monthRevenue = monthSales.reduce((sum, s) => sum + (s.sale_value || 0), 0)
      
      // Losses in this month
      const monthLosses = losses.filter(l => {
        if (!l.lost_at && !l.created_at) return false
        const lossDate = l.lost_at ? new Date(l.lost_at) : new Date(l.created_at)
        return lossDate >= monthStart && lossDate <= monthEnd
      }).length
      
      months.push({
        month: date.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }),
        clients: monthClients,
        sales: monthSalesCount,
        losses: monthLosses,
        revenue: monthRevenue,
      })
    }
    
    return months
  }
  
  private async calculateBrokerPerformance(
    corretores: any[],
    allSales: any[],
    attendances: any[]
  ): Promise<BrokerPerformance[]> {
    const performance: BrokerPerformance[] = []
    
    for (const broker of corretores) {
      // Get broker sales (completed sales with this broker_id)
      const brokerSales = allSales.filter(s => 
        s.broker_id === broker.id && s.status === 'COMPLETED'
      )
      
      const totalSales = brokerSales.length
      const totalRevenue = brokerSales.reduce((sum, s) => sum + (s.sale_value || 0), 0)
      const totalCommission = brokerSales.reduce((sum, s) => sum + (s.commission_value || 0), 0)
      
      // Get active attendances for this broker (agent_id)
      const brokerAttendances = attendances.filter(a => 
        a.agent_id === broker.id && a.status === 'ACTIVE'
      )
      const activeClients = new Set(brokerAttendances.map(a => a.client_id)).size
      
      // Calculate conversion rate: completed sales / total attendances (including closed ones)
      const allBrokerAttendances = attendances.filter(a => a.agent_id === broker.id)
      const conversionRate = allBrokerAttendances.length > 0
        ? (totalSales / allBrokerAttendances.length) * 100
        : 0
      
      performance.push({
        broker_id: broker.id,
        broker_name: broker.full_name || broker.name || 'Sem nome',
        total_sales: totalSales,
        total_revenue: totalRevenue,
        total_commission: totalCommission,
        conversion_rate: Math.round(conversionRate * 100) / 100,
        active_clients: activeClients,
      })
    }
    
    // Sort by revenue descending, but include all brokers even with 0 sales
    return performance.sort((a, b) => b.total_revenue - a.total_revenue)
  }
  
  private calculateInsights(
    clients: Client[],
    _attendances: any[],
    visits: any[]
  ): DashboardInsights {
    // Top opportunities (high lead score, not won/lost)
    const topOpportunities = clients
      .filter(c => 
        c.current_lead_score && 
        c.current_lead_score >= 70 &&
        c.current_status && 
        !['WON', 'LOST', 'INACTIVE'].includes(c.current_status)
      )
      .sort((a, b) => (b.current_lead_score || 0) - (a.current_lead_score || 0))
      .slice(0, 5)
    
    // At risk clients (had contact before, but no contact in 7+ days, high urgency)
    // Clients who never had contact are NOT at risk - they're awaiting first contact
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    
    const atRiskClients = clients
      .filter(c => {
        if (!c.last_contact_at) return false // Never contacted = not "at risk"
        const lastContact = new Date(c.last_contact_at)
        return lastContact < sevenDaysAgo &&
          c.current_urgency_level &&
          ['HIGH', 'IMMEDIATE'].includes(c.current_urgency_level) &&
          c.current_status &&
          !['WON', 'LOST', 'INACTIVE'].includes(c.current_status)
      })
      .slice(0, 5)
    
    // High value leads (high budget)
    const highValueLeads = clients
      .filter(c => 
        c.current_budget_max && 
        parseFloat(c.current_budget_max) >= 500000 &&
        c.current_status &&
        !['WON', 'LOST', 'INACTIVE'].includes(c.current_status)
      )
      .sort((a, b) => 
        parseFloat(b.current_budget_max || '0') - parseFloat(a.current_budget_max || '0')
      )
      .slice(0, 5)
    
    // Recommendations
    const recommendations: string[] = []
    if (atRiskClients.length > 0) {
      recommendations.push(`${atRiskClients.length} clientes de alta urgência sem contato há mais de 7 dias`)
    }
    if (topOpportunities.length > 0) {
      recommendations.push(`${topOpportunities.length} oportunidades de alto valor precisam de atenção`)
    }
    const pendingVisitStatuses = ['SCHEDULED', 'CONFIRMED', 'IN_PROGRESS']
    const upcomingVisits = visits.filter(v => {
      if (!v.scheduled_at) return false
      if (!pendingVisitStatuses.includes(v.status || '')) return false
      const scheduled = new Date(v.scheduled_at)
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      return scheduled >= new Date() && scheduled <= tomorrow
    }).length
    if (upcomingVisits > 0) {
      recommendations.push(`${upcomingVisits} visitas agendadas para amanhã`)
    }
    
    // Alerts
    const alerts: Alert[] = []
    if (atRiskClients.length > 0) {
      alerts.push({
        type: 'warning',
        title: 'Clientes em Risco',
        message: `${atRiskClients.length} clientes de alta urgência sem contato recente`,
        action_url: '/clients?filter=at_risk',
      })
    }
    if (topOpportunities.length > 0) {
      alerts.push({
        type: 'info',
        title: 'Oportunidades',
        message: `${topOpportunities.length} leads de alto valor aguardando ação`,
        action_url: '/clients?filter=high_value',
      })
    }
    
    return {
      top_opportunities: topOpportunities,
      at_risk_clients: atRiskClients,
      high_value_leads: highValueLeads,
      recommendations,
      alerts,
    }
  }
}

export const dashboardService = new DashboardService()

