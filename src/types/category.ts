export interface Category {
  slug: string
  name: string
  nameEn: string
  icon: string
  description: string
  descriptionEn: string
  color: string
}

export interface UserCategory {
  id: string
  user_id: string
  category_slug: string
  display_order: number
  is_enabled: boolean
  created_at: string
  updated_at: string
}

export const CATEGORIES: Category[] = [
  {
    slug: 'profile',
    name: '基本情報',
    nameEn: 'Profile',
    icon: '👤',
    description: '名前、連絡先、住所など基本的な個人情報',
    descriptionEn: 'Name, contact, address and basic personal information',
    color: '#6366f1',
  },
  {
    slug: 'goals',
    name: '目標・ビジョン',
    nameEn: 'Goals & Vision',
    icon: '🎯',
    description: '人生目標、年間目標、夢リスト',
    descriptionEn: 'Life goals, annual targets, dream list',
    color: '#f59e0b',
  },
  {
    slug: 'career',
    name: 'キャリア',
    nameEn: 'Career',
    icon: '💼',
    description: '職歴、スキル、資格、実績',
    descriptionEn: 'Work history, skills, certifications, achievements',
    color: '#3b82f6',
  },
  {
    slug: 'health',
    name: '健康',
    nameEn: 'Health',
    icon: '🏃',
    description: '健康記録、運動習慣、身体データ',
    descriptionEn: 'Health records, exercise habits, body data',
    color: '#22c55e',
  },
  {
    slug: 'finance',
    name: 'ファイナンス',
    nameEn: 'Finance',
    icon: '💰',
    description: '資産情報、財務目標、大きな支出計画',
    descriptionEn: 'Assets, financial goals, major expense plans',
    color: '#eab308',
  },
  {
    slug: 'learning',
    name: '学習',
    nameEn: 'Learning',
    icon: '📚',
    description: '学歴、学習履歴、取得資格、読書リスト',
    descriptionEn: 'Education, learning history, certifications, reading list',
    color: '#8b5cf6',
  },
  {
    slug: 'relationships',
    name: '人間関係',
    nameEn: 'Relationships',
    icon: '👥',
    description: '家族、友人、メンター、ネットワーク',
    descriptionEn: 'Family, friends, mentors, network',
    color: '#ec4899',
  },
  {
    slug: 'lifestyle',
    name: 'ライフスタイル',
    nameEn: 'Lifestyle',
    icon: '✨',
    description: '趣味、興味関心、やりたいことリスト',
    descriptionEn: 'Hobbies, interests, bucket list',
    color: '#14b8a6',
  },
  {
    slug: 'housing',
    name: '住居・不動産',
    nameEn: 'Housing',
    icon: '🏠',
    description: '現住所、希望条件、物件履歴',
    descriptionEn: 'Current address, preferences, property history',
    color: '#f97316',
  },
  {
    slug: 'business',
    name: 'ビジネス資産',
    nameEn: 'Business Assets',
    icon: '🏢',
    description: '所有事業、株式、知的財産',
    descriptionEn: 'Owned businesses, equity, intellectual property',
    color: '#64748b',
  },
  {
    slug: 'product',
    name: 'プロダクトマネジメント',
    nameEn: 'Product Management',
    icon: '📦',
    description: 'プロダクト戦略、ロードマップ、KPI管理',
    descriptionEn: 'Product strategy, roadmaps, KPI tracking',
    color: '#0ea5e9',
  },
]

export function getCategoryBySlug(slug: string): Category | undefined {
  return CATEGORIES.find((c) => c.slug === slug)
}

export function getAddableCategories(): Category[] {
  // Profile is always shown, so exclude from addable list
  return CATEGORIES.filter((c) => c.slug !== 'profile')
}
