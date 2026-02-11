'use client'

import { useState, useCallback } from 'react'
import { useI18n } from '@/lib/i18n'
import { upsertSharingRule } from '@/lib/graph'
import type { Category, SharingRule } from '@/types/graph'
import { CATEGORY_TEMPLATES } from '@/types/graph'

interface SharingRuleListProps {
  userId: string
  categories: Category[]
  sharingRules: SharingRule[]
  onRulesChange: () => void
}

export function SharingRuleList({
  userId,
  categories,
  sharingRules,
  onRulesChange,
}: SharingRuleListProps) {
  const { t, language } = useI18n()
  const [updating, setUpdating] = useState<string | null>(null)

  const getCategoryRule = useCallback(
    (categoryId: string) => {
      return sharingRules.find(
        (r) => r.category_id === categoryId && !r.node_type && !r.node_id
      )
    },
    [sharingRules]
  )

  const getTypeRule = useCallback(
    (categoryId: string, nodeType: string) => {
      return sharingRules.find(
        (r) => r.category_id === categoryId && r.node_type === nodeType && !r.node_id
      )
    },
    [sharingRules]
  )

  const isCategoryShareable = useCallback(
    (categoryId: string) => {
      const rule = getCategoryRule(categoryId)
      return rule?.is_shareable ?? false
    },
    [getCategoryRule]
  )

  const isTypeShareable = useCallback(
    (categoryId: string, nodeType: string) => {
      const typeRule = getTypeRule(categoryId, nodeType)
      if (typeRule) return typeRule.is_shareable
      // Inherit from category level
      return isCategoryShareable(categoryId)
    },
    [getTypeRule, isCategoryShareable]
  )

  const handleToggleCategory = async (categoryId: string) => {
    const key = `cat-${categoryId}`
    setUpdating(key)
    const currentlyShareable = isCategoryShareable(categoryId)
    await upsertSharingRule(userId, {
      category_id: categoryId,
      is_shareable: !currentlyShareable,
    })
    onRulesChange()
    setUpdating(null)
  }

  const handleToggleType = async (categoryId: string, nodeType: string) => {
    const key = `type-${categoryId}-${nodeType}`
    setUpdating(key)
    const currentlyShareable = isTypeShareable(categoryId, nodeType)
    await upsertSharingRule(userId, {
      category_id: categoryId,
      node_type: nodeType,
      is_shareable: !currentlyShareable,
    })
    onRulesChange()
    setUpdating(null)
  }

  const getNodeTypesForCategory = (category: Category) => {
    const template = CATEGORY_TEMPLATES.find(
      (t) => t.slug === category.slug || t.slug === category.template_slug
    )
    return template?.node_types || []
  }

  const getNodeTypeDisplayName = (nodeType: string) => {
    const template = CATEGORY_TEMPLATES.flatMap((t) =>
      t.node_types.map((nt) => ({ type: nt, template: t }))
    ).find((item) => item.type === nodeType)
    if (!template) return nodeType
    return nodeType
  }

  if (categories.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center py-10"
        style={{ color: 'var(--text-muted)' }}
      >
        <svg
          className="w-8 h-8 mb-3"
          style={{ opacity: 0.3 }}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
          />
        </svg>
        <p className="text-xs">{t.sharing.noRules}</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {categories.map((category) => {
        const nodeTypes = getNodeTypesForCategory(category)
        const shareable = isCategoryShareable(category.id)
        const catUpdating = updating === `cat-${category.id}`

        return (
          <div key={category.id} className="card">
            {/* Category Row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                {category.color && (
                  <div
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ background: category.color }}
                  />
                )}
                <div className="min-w-0">
                  <p
                    className="text-sm font-medium truncate"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {language === 'en' && category.name_en
                      ? category.name_en
                      : category.name}
                  </p>
                  <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                    {t.sharing.categoryLevel}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className="text-[10px]"
                  style={{
                    color: shareable ? 'var(--success)' : 'var(--text-muted)',
                  }}
                >
                  {shareable ? t.sharing.shareable : t.sharing.notShareable}
                </span>
                <button
                  type="button"
                  className={`toggle-switch ${shareable ? 'active' : ''}`}
                  onClick={() => handleToggleCategory(category.id)}
                  disabled={catUpdating}
                  aria-label={`Toggle sharing for ${category.name}`}
                  aria-disabled={catUpdating}
                />
              </div>
            </div>

            {/* Node Types (expanded when category is shareable) */}
            {shareable && nodeTypes.length > 1 && (
              <div
                className="mt-3 pt-3 space-y-2"
                style={{ borderTop: '1px solid var(--border-subtle)' }}
              >
                {nodeTypes.map((nodeType) => {
                  const typeShareable = isTypeShareable(category.id, nodeType)
                  const typeUpdating =
                    updating === `type-${category.id}-${nodeType}`
                  return (
                    <div
                      key={nodeType}
                      className="flex items-center justify-between pl-5"
                    >
                      <div>
                        <p
                          className="text-xs"
                          style={{ color: 'var(--text-secondary)' }}
                        >
                          {getNodeTypeDisplayName(nodeType)}
                        </p>
                        <p
                          className="text-[10px]"
                          style={{ color: 'var(--text-muted)' }}
                        >
                          {t.sharing.typeLevel}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span
                          className="text-[10px]"
                          style={{
                            color: typeShareable
                              ? 'var(--success)'
                              : 'var(--text-muted)',
                          }}
                        >
                          {typeShareable
                            ? t.sharing.shareable
                            : t.sharing.notShareable}
                        </span>
                        <button
                          type="button"
                          className={`toggle-switch ${typeShareable ? 'active' : ''}`}
                          onClick={() =>
                            handleToggleType(category.id, nodeType)
                          }
                          disabled={typeUpdating}
                          aria-label={`Toggle sharing for ${nodeType}`}
                          aria-disabled={typeUpdating}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
