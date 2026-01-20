export interface Product {
  id: string
  user_id: string
  name: string
  description: string | null
  status: 'active' | 'archived' | 'planning'
  vision: string | null
  mission: string | null
  created_at: string
  updated_at: string
}

export interface ProductInput {
  name: string
  description?: string | null
  status?: 'active' | 'archived' | 'planning'
  vision?: string | null
  mission?: string | null
}

export interface RoadmapItem {
  id: string
  product_id: string
  user_id: string
  title: string
  description: string | null
  status: 'planned' | 'in_progress' | 'completed' | 'cancelled'
  priority: 'low' | 'medium' | 'high' | 'critical'
  quarter: string | null
  target_date: string | null
  completed_date: string | null
  display_order: number
  created_at: string
  updated_at: string
}

export interface RoadmapItemInput {
  product_id: string
  title: string
  description?: string | null
  status?: 'planned' | 'in_progress' | 'completed' | 'cancelled'
  priority?: 'low' | 'medium' | 'high' | 'critical'
  quarter?: string | null
  target_date?: string | null
}

export interface ProductKPI {
  id: string
  product_id: string
  user_id: string
  name: string
  description: string | null
  current_value: number | null
  target_value: number | null
  unit: string | null
  period: string | null
  last_updated: string
  created_at: string
  updated_at: string
}

export interface ProductKPIInput {
  product_id: string
  name: string
  description?: string | null
  current_value?: number | null
  target_value?: number | null
  unit?: string | null
  period?: string | null
}

export interface ProductWithDetails extends Product {
  roadmap_items: RoadmapItem[]
  kpis: ProductKPI[]
}

// Status labels
export const STATUS_LABELS = {
  ja: {
    product: {
      active: '進行中',
      archived: 'アーカイブ',
      planning: '企画中',
    },
    roadmap: {
      planned: '計画中',
      in_progress: '進行中',
      completed: '完了',
      cancelled: '中止',
    },
    priority: {
      low: '低',
      medium: '中',
      high: '高',
      critical: '緊急',
    },
  },
  en: {
    product: {
      active: 'Active',
      archived: 'Archived',
      planning: 'Planning',
    },
    roadmap: {
      planned: 'Planned',
      in_progress: 'In Progress',
      completed: 'Completed',
      cancelled: 'Cancelled',
    },
    priority: {
      low: 'Low',
      medium: 'Medium',
      high: 'High',
      critical: 'Critical',
    },
  },
}

// Priority colors
export const PRIORITY_COLORS = {
  low: '#64748b',
  medium: '#3b82f6',
  high: '#f59e0b',
  critical: '#ef4444',
}

// Status colors
export const ROADMAP_STATUS_COLORS = {
  planned: '#64748b',
  in_progress: '#3b82f6',
  completed: '#22c55e',
  cancelled: '#ef4444',
}
