export type GoalStatus = 'not_started' | 'in_progress' | 'completed' | 'abandoned'

export interface GoalProperties {
  description?: string
  status?: GoalStatus
  progress?: number
  category?: string
  deadline?: string
  milestones?: Array<{ title: string; completed: boolean }>
  [key: string]: unknown
}
