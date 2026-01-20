'use client'

const STORAGE_KEY = 'mindbrew_recent_accounts'
const MAX_ACCOUNTS = 3

export interface RecentAccount {
  email: string
  name?: string
  avatarInitial: string
  lastUsed: number // timestamp
}

/**
 * 最近使用したアカウントの一覧を取得
 */
export function getRecentAccounts(): RecentAccount[] {
  if (typeof window === 'undefined') return []

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return []

    const accounts = JSON.parse(stored) as RecentAccount[]
    // 最新順にソート
    return accounts.sort((a, b) => b.lastUsed - a.lastUsed)
  } catch {
    return []
  }
}

/**
 * アカウントを履歴に追加（最大3つ、重複は更新）
 */
export function addRecentAccount(email: string, name?: string): void {
  if (typeof window === 'undefined') return

  try {
    const accounts = getRecentAccounts()

    // 既存のアカウントを探す
    const existingIndex = accounts.findIndex(a => a.email === email)

    const newAccount: RecentAccount = {
      email,
      name,
      avatarInitial: (name || email).charAt(0).toUpperCase(),
      lastUsed: Date.now(),
    }

    if (existingIndex >= 0) {
      // 既存のアカウントを更新
      accounts[existingIndex] = newAccount
    } else {
      // 新しいアカウントを追加
      accounts.unshift(newAccount)
    }

    // 最大3つに制限
    const trimmed = accounts
      .sort((a, b) => b.lastUsed - a.lastUsed)
      .slice(0, MAX_ACCOUNTS)

    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed))
  } catch {
    // localStorage が使えない環境では無視
  }
}

/**
 * 特定のアカウントを履歴から削除
 */
export function removeRecentAccount(email: string): void {
  if (typeof window === 'undefined') return

  try {
    const accounts = getRecentAccounts()
    const filtered = accounts.filter(a => a.email !== email)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
  } catch {
    // 無視
  }
}

/**
 * 全ての履歴をクリア
 */
export function clearRecentAccounts(): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // 無視
  }
}
