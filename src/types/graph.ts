// Centra Personal Knowledge Graph Types

// ============================================
// Category (User-created grouping / Space)
// ============================================

export interface Category {
  id: string
  user_id: string
  slug: string
  name: string
  name_en?: string
  icon?: string
  color?: string
  description?: string
  template_slug?: string
  display_order: number
  is_system: boolean
  created_at: string
  updated_at: string
}

export interface CategoryInput {
  slug: string
  name: string
  name_en?: string
  icon?: string
  color?: string
  description?: string
  template_slug?: string
  display_order?: number
  is_system?: boolean
}

// ============================================
// Node (Data entry within a category)
// ============================================

export interface Node {
  id: string
  user_id: string
  category_id: string
  node_type: string
  title?: string
  properties: Record<string, unknown>
  display_order: number
  is_archived: boolean
  created_at: string
  updated_at: string
}

export interface NodeInput {
  category_id: string
  node_type: string
  title?: string
  properties?: Record<string, unknown>
  display_order?: number
  is_archived?: boolean
}

// ============================================
// Edge (Relation between nodes)
// ============================================

export interface Edge {
  id: string
  user_id: string
  source_id: string
  target_id: string
  relation_type: string
  properties: Record<string, unknown>
  created_at: string
}

export interface EdgeInput {
  source_id: string
  target_id: string
  relation_type: string
  properties?: Record<string, unknown>
}

// ============================================
// Node Type Schema (Optional type definitions)
// ============================================

export interface NodeTypeSchema {
  id: string
  user_id: string | null
  node_type: string
  display_name: string
  display_name_en?: string
  icon?: string
  schema: Record<string, unknown>
  is_system: boolean
}

// ============================================
// Sharing Rules (OAuth scope mapping)
// ============================================

export interface SharingRule {
  id: string
  user_id: string
  node_id?: string
  category_id?: string
  node_type?: string
  property_path?: string
  is_shareable: boolean
  scope?: string
  created_at: string
  updated_at: string
}

export interface SharingRuleInput {
  node_id?: string
  category_id?: string
  node_type?: string
  property_path?: string
  is_shareable: boolean
  scope?: string
}

// ============================================
// Composite Types (with relations)
// ============================================

export interface NodeWithRelations extends Node {
  category: Category
  edges: EdgeWithNode[]
}

export interface EdgeWithNode extends Edge {
  related_node: Node
}

export interface CategoryWithNodes extends Category {
  nodes: Node[]
}

// ============================================
// Relation Types
// ============================================

export const RELATION_TYPES = [
  'related_to',
  'has_skill',
  'part_of',
  'requires',
  'achieved_by',
  'tracks',
  'contacts',
] as const

export type RelationType = typeof RELATION_TYPES[number]

// ============================================
// Built-in Node Types
// ============================================

export const NODE_TYPES = {
  Profile: 'Profile',
  Skill: 'Skill',
  WorkExperience: 'WorkExperience',
  Goal: 'Goal',
  Product: 'Product',
  RoadmapItem: 'RoadmapItem',
  KPI: 'KPI',
  HealthRecord: 'HealthRecord',
  LearningItem: 'LearningItem',
  FinanceRecord: 'FinanceRecord',
  Asset: 'Asset',
  Contact: 'Contact',
  Hobby: 'Hobby',
  Property: 'Property',
  Business: 'Business',
  Habit: 'Habit',
} as const

export type NodeType = typeof NODE_TYPES[keyof typeof NODE_TYPES]

// ============================================
// Category Templates (Presets)
// ============================================

export interface CategoryTemplate {
  slug: string
  name: string
  name_en: string
  icon: string
  color: string
  description: string
  description_en: string
  node_types: string[]
}

export const CATEGORY_TEMPLATES: CategoryTemplate[] = [
  {
    slug: 'profile',
    name: '基本情報',
    name_en: 'Profile',
    icon: 'user',
    color: '#a0a0a0',
    description: '名前、連絡先、住所など基本的な個人情報',
    description_en: 'Name, contact, address and basic personal information',
    node_types: ['Profile'],
  },
  {
    slug: 'goals',
    name: '目標・ビジョン',
    name_en: 'Goals & Vision',
    icon: 'target',
    color: '#f59e0b',
    description: '人生目標、年間目標、夢リスト',
    description_en: 'Life goals, annual targets, dream list',
    node_types: ['Goal'],
  },
  {
    slug: 'career',
    name: 'キャリア',
    name_en: 'Career',
    icon: 'briefcase',
    color: '#3b82f6',
    description: '職歴、スキル、資格、実績',
    description_en: 'Work history, skills, certifications, achievements',
    node_types: ['WorkExperience', 'Skill'],
  },
  {
    slug: 'health',
    name: '健康',
    name_en: 'Health',
    icon: 'heart-pulse',
    color: '#22c55e',
    description: '健康記録、運動習慣、身体データ',
    description_en: 'Health records, exercise habits, body data',
    node_types: ['HealthRecord'],
  },
  {
    slug: 'finance',
    name: 'ファイナンス',
    name_en: 'Finance',
    icon: 'wallet',
    color: '#eab308',
    description: '資産情報、財務目標、大きな支出計画',
    description_en: 'Assets, financial goals, major expense plans',
    node_types: ['FinanceRecord', 'Asset'],
  },
  {
    slug: 'learning',
    name: '学習',
    name_en: 'Learning',
    icon: 'book-open',
    color: '#8b5cf6',
    description: '学歴、学習履歴、取得資格、読書リスト',
    description_en: 'Education, learning history, certifications, reading list',
    node_types: ['LearningItem'],
  },
  {
    slug: 'relationships',
    name: '人間関係',
    name_en: 'Relationships',
    icon: 'users',
    color: '#ec4899',
    description: '家族、友人、メンター、ネットワーク',
    description_en: 'Family, friends, mentors, network',
    node_types: ['Contact'],
  },
  {
    slug: 'lifestyle',
    name: 'ライフスタイル',
    name_en: 'Lifestyle',
    icon: 'sparkles',
    color: '#14b8a6',
    description: '趣味、興味関心、やりたいことリスト',
    description_en: 'Hobbies, interests, bucket list',
    node_types: ['Hobby'],
  },
  {
    slug: 'housing',
    name: '住居・不動産',
    name_en: 'Housing',
    icon: 'home',
    color: '#f97316',
    description: '現住所、希望条件、物件履歴',
    description_en: 'Current address, preferences, property history',
    node_types: ['Property'],
  },
  {
    slug: 'business',
    name: 'ビジネス資産',
    name_en: 'Business Assets',
    icon: 'building',
    color: '#64748b',
    description: '所有事業、株式、知的財産',
    description_en: 'Owned businesses, equity, intellectual property',
    node_types: ['Business'],
  },
  {
    slug: 'product',
    name: 'プロダクト管理',
    name_en: 'Product Management',
    icon: 'package',
    color: '#0ea5e9',
    description: 'プロダクト戦略、ロードマップ、KPI管理',
    description_en: 'Product strategy, roadmaps, KPI tracking',
    node_types: ['Product', 'RoadmapItem', 'KPI'],
  },
  {
    slug: 'habits',
    name: '習慣',
    name_en: 'Habits',
    icon: 'repeat',
    color: '#f97316',
    description: '科学的に証明された習慣テクニックで毎日をアップデート',
    description_en: 'Science-backed habit techniques to upgrade your daily life',
    node_types: ['Habit'],
  },
]

// ============================================
// Habit Chapter Types (from すごい習慣大百科)
// ============================================

export const HABIT_CHAPTERS = {
  work: 'work',
  study: 'study',
  health: 'health',
  communication: 'communication',
  mental: 'mental',
  lifestyle: 'lifestyle',
} as const

export type HabitChapter = typeof HABIT_CHAPTERS[keyof typeof HABIT_CHAPTERS]

export const HABIT_CHAPTER_LABELS: Record<HabitChapter, { ja: string; en: string }> = {
  work: { ja: '仕事の効率化', en: 'Work Efficiency' },
  study: { ja: '勉強', en: 'Study' },
  health: { ja: '健康', en: 'Health' },
  communication: { ja: 'コミュニケーション', en: 'Communication' },
  mental: { ja: 'メンタル', en: 'Mental' },
  lifestyle: { ja: '生活', en: 'Lifestyle' },
}

export const HABIT_CHAPTER_ICONS: Record<HabitChapter, string> = {
  work: 'briefcase',
  study: 'book-open',
  health: 'heart-pulse',
  communication: 'message-circle',
  mental: 'brain',
  lifestyle: 'sun',
}

export const HABIT_CHAPTER_COLORS: Record<HabitChapter, string> = {
  work: '#3b82f6',
  study: '#8b5cf6',
  health: '#22c55e',
  communication: '#ec4899',
  mental: '#f59e0b',
  lifestyle: '#14b8a6',
}

// ============================================
// Habit Principles (3つの習慣化原理)
// ============================================

export const HABIT_PRINCIPLES = {
  act_first: 'act_first',
  habit_stacking: 'habit_stacking',
  environment_design: 'environment_design',
} as const

export type HabitPrinciple = typeof HABIT_PRINCIPLES[keyof typeof HABIT_PRINCIPLES]

export const HABIT_PRINCIPLE_LABELS: Record<HabitPrinciple, { ja: string; en: string; description_ja: string; description_en: string }> = {
  act_first: {
    ja: 'まず動く',
    en: 'Act First',
    description_ja: '考える前にまず行動する。脳は動き出すと自然にやる気を生み出す。',
    description_en: 'Act before thinking. Your brain naturally generates motivation once you start moving.',
  },
  habit_stacking: {
    ja: '既存の習慣にくっつける',
    en: 'Habit Stacking',
    description_ja: '既にある習慣の前後に新しい習慣を紐づける。',
    description_en: 'Attach a new habit before or after an existing routine.',
  },
  environment_design: {
    ja: '環境を利用する',
    en: 'Environment Design',
    description_ja: '意志力に頼らず、環境を変えて自然に行動できるようにする。',
    description_en: 'Change your environment so the desired behavior becomes natural, without relying on willpower.',
  },
}

// ============================================
// Habit Frequency
// ============================================

export const HABIT_FREQUENCIES = {
  daily: 'daily',
  weekday: 'weekday',
  weekly: 'weekly',
  custom: 'custom',
} as const

export type HabitFrequency = typeof HABIT_FREQUENCIES[keyof typeof HABIT_FREQUENCIES]

export const HABIT_FREQUENCY_LABELS: Record<HabitFrequency, { ja: string; en: string }> = {
  daily: { ja: '毎日', en: 'Daily' },
  weekday: { ja: '平日', en: 'Weekdays' },
  weekly: { ja: '週1回', en: 'Weekly' },
  custom: { ja: 'カスタム', en: 'Custom' },
}

// ============================================
// Habit Properties (stored in Node.properties)
// ============================================

export interface HabitProperties {
  chapter?: HabitChapter
  frequency?: HabitFrequency
  principle?: HabitPrinciple
  evidence?: string
  trigger?: string
  streak?: number
  best_streak?: number
  completed_dates?: string[]
  is_active?: boolean
}

// ============================================
// Habit Utilities
// ============================================

/** Get today's date string in the user's local timezone (YYYY-MM-DD) */
export function getLocalToday(): string {
  return new Date().toLocaleDateString('en-CA')
}

/** Calculate current streak from dates array. Dates must be YYYY-MM-DD format. */
export function calculateStreak(dates: string[], referenceDate?: string): number {
  if (dates.length === 0) return 0

  const sorted = [...dates].sort().reverse()
  const ref = referenceDate || getLocalToday()

  // Streak must start from today or yesterday
  const firstDate = sorted[0]
  if (firstDate !== ref) {
    const yesterday = new Date(ref)
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toLocaleDateString('en-CA')
    if (firstDate !== yesterdayStr) return 0
  }

  let streak = 1
  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1])
    const curr = new Date(sorted[i])
    const diffDays = Math.round((prev.getTime() - curr.getTime()) / (1000 * 60 * 60 * 24))
    if (diffDays === 1) {
      streak++
    } else {
      break
    }
  }

  return streak
}

/** Trim completed_dates to keep only the most recent N entries */
export function trimCompletedDates(dates: string[], maxEntries = 90): string[] {
  if (dates.length <= maxEntries) return dates
  return [...dates].sort().reverse().slice(0, maxEntries)
}

export function getTemplateBySlug(slug: string): CategoryTemplate | undefined {
  return CATEGORY_TEMPLATES.find((t) => t.slug === slug)
}

export function getAddableTemplates(): CategoryTemplate[] {
  return CATEGORY_TEMPLATES.filter((t) => t.slug !== 'profile')
}
