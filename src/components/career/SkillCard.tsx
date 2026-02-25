'use client'

import { useState } from 'react'
import { createPortal } from 'react-dom'
import type { Node } from '@/types/graph'

interface SkillCardProps {
  node: Node
  onEdit: () => void
  onDelete: () => void
  language: string
}

const CATEGORY_COLORS: Record<string, string> = {
  Programming: '#3b82f6',
  Language: '#8b5cf6',
  Management: '#f59e0b',
  Design: '#ec4899',
  Other: '#6b7280',
}

export function SkillCard({ node, onEdit, onDelete, language }: SkillCardProps) {
  const [showMenu, setShowMenu] = useState(false)
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 })
  const props = node.properties as {
    category?: string
    proficiency?: number
    years?: number
  }

  const proficiency = props.proficiency || 0
  const categoryColor = CATEGORY_COLORS[props.category || 'Other'] || CATEGORY_COLORS.Other

  const categoryLabels: Record<string, Record<string, string>> = {
    Programming: { en: 'Programming', ja: 'プログラミング' },
    Language: { en: 'Language', ja: '言語' },
    Management: { en: 'Management', ja: 'マネジメント' },
    Design: { en: 'Design', ja: 'デザイン' },
    Other: { en: 'Other', ja: 'その他' },
  }

  const proficiencyLabels: Record<number, Record<string, string>> = {
    1: { en: 'Beginner', ja: '初級' },
    2: { en: 'Elementary', ja: '初中級' },
    3: { en: 'Intermediate', ja: '中級' },
    4: { en: 'Advanced', ja: '上級' },
    5: { en: 'Expert', ja: 'エキスパート' },
  }

  const catLabel = categoryLabels[props.category || 'Other']?.[language] || props.category || ''
  const profLabel = proficiencyLabels[proficiency]?.[language] || ''

  return (
    <div
      className="rounded-xl p-4 transition-colors hover:bg-white/[0.02]"
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <h4
              className="font-medium text-sm truncate"
              style={{ color: 'var(--text-primary)' }}
            >
              {node.title}
            </h4>
            <span
              className="px-2 py-0.5 rounded text-xs font-medium flex-shrink-0"
              style={{
                background: `${categoryColor}20`,
                color: categoryColor,
              }}
            >
              {catLabel}
            </span>
          </div>

          {/* Proficiency bar */}
          <div className="flex items-center gap-2 mb-2">
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((level) => (
                <div
                  key={level}
                  className="w-5 h-1.5 rounded-full"
                  style={{
                    background: level <= proficiency
                      ? categoryColor
                      : 'var(--bg-surface-hover)',
                  }}
                />
              ))}
            </div>
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {profLabel}
            </span>
          </div>

          {/* Years badge */}
          {props.years != null && props.years > 0 && (
            <span
              className="text-xs px-2 py-0.5 rounded-full"
              style={{
                background: 'var(--bg-surface-hover)',
                color: 'var(--text-muted)',
              }}
            >
              {props.years} {language === 'en' ? (props.years === 1 ? 'year' : 'years') : '年'}
            </span>
          )}
        </div>

        {/* Actions menu */}
        <div className="relative flex-shrink-0">
          <button
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect()
              setMenuPos({ top: rect.bottom + 4, left: rect.right - 128 })
              setShowMenu(!showMenu)
            }}
            className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:bg-white/10"
            style={{ color: 'var(--text-muted)' }}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
          </button>

          {showMenu && createPortal(
            <>
              <div
                className="fixed inset-0"
                style={{ zIndex: 'var(--z-overlay)' }}
                onClick={() => setShowMenu(false)}
              />
              <div
                className="fixed w-32 rounded-xl overflow-hidden shadow-xl"
                style={{
                  zIndex: 'var(--z-modal)',
                  top: menuPos.top,
                  left: menuPos.left,
                  background: 'var(--bg-overlay)',
                  border: '1px solid var(--border-default)',
                  backdropFilter: 'blur(20px)',
                }}
              >
                <button
                  onClick={() => {
                    onEdit()
                    setShowMenu(false)
                  }}
                  className="w-full px-4 py-2.5 text-left text-sm transition-colors hover:bg-white/10 flex items-center gap-2"
                  style={{ color: 'var(--text-primary)' }}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  {language === 'en' ? 'Edit' : '編集'}
                </button>
                <button
                  onClick={() => {
                    onDelete()
                    setShowMenu(false)
                  }}
                  className="w-full px-4 py-2.5 text-left text-sm transition-colors hover:bg-white/10 flex items-center gap-2"
                  style={{
                    color: 'var(--error-light)',
                    borderTop: '1px solid var(--border-default)',
                  }}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  {language === 'en' ? 'Delete' : '削除'}
                </button>
              </div>
            </>,
            document.body
          )}
        </div>
      </div>
    </div>
  )
}
