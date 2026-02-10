'use client'

import { useState, useEffect } from 'react'
import { useI18n } from '@/lib/i18n'
import { createNode, updateNode } from '@/lib/graph'
import type { Node, NodeInput } from '@/types/graph'

interface PropertyRow {
  key: string
  value: string
}

interface NodeFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (node: Node) => void
  node?: Node
  categoryId: string
  userId: string
  availableNodeTypes: string[]
}

export function NodeFormModal({
  isOpen,
  onClose,
  onSubmit,
  node,
  categoryId,
  userId,
  availableNodeTypes,
}: NodeFormModalProps) {
  const { t } = useI18n()
  const isEditing = !!node

  const [title, setTitle] = useState('')
  const [nodeType, setNodeType] = useState(availableNodeTypes[0] || '')
  const [properties, setProperties] = useState<PropertyRow[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      setError(null)
      if (node) {
        setTitle(node.title || '')
        setNodeType(node.node_type)
        const entries = Object.entries(node.properties).filter(
          ([, v]) => v !== null && v !== undefined
        )
        setProperties(
          entries.length > 0
            ? entries.map(([key, value]) => ({ key, value: String(value) }))
            : []
        )
      } else {
        setTitle('')
        setNodeType(availableNodeTypes[0] || '')
        setProperties([])
      }
    }
  }, [isOpen, node, availableNodeTypes])

  if (!isOpen) return null

  const addProperty = () => {
    setProperties([...properties, { key: '', value: '' }])
  }

  const removeProperty = (index: number) => {
    setProperties(properties.filter((_, i) => i !== index))
  }

  const updateProperty = (index: number, field: 'key' | 'value', val: string) => {
    const updated = [...properties]
    updated[index] = { ...updated[index], [field]: val }
    setProperties(updated)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    setSaving(true)

    const props: Record<string, unknown> = {}
    for (const p of properties) {
      if (p.key.trim()) {
        props[p.key.trim()] = p.value
      }
    }

    try {
      if (isEditing && node) {
        const result = await updateNode(node.id, {
          title: title.trim(),
          properties: props,
        })
        if (result) {
          onSubmit(result)
          onClose()
        }
      } else {
        const input: NodeInput = {
          category_id: categoryId,
          node_type: nodeType,
          title: title.trim(),
          properties: props,
        }
        const result = await createNode(userId, input)
        if (result) {
          onSubmit(result)
          onClose()
        }
      }
    } catch (err) {
      console.error('Failed to save node:', err)
      setError(t.nodes.saveError)
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/70"
        onClick={() => !saving && onClose()}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="relative w-full max-w-lg max-h-[80vh] overflow-hidden animate-scale-in"
          style={{
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-md)',
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-5 py-4"
            style={{ borderBottom: '1px solid var(--border-subtle)' }}
          >
            <h2
              className="text-sm font-medium"
              style={{ color: 'var(--text-primary)' }}
            >
              {isEditing ? t.nodes.editNode : t.nodes.addNode}
            </h2>
            <button
              onClick={() => !saving && onClose()}
              className="w-7 h-7 rounded flex items-center justify-center transition-colors"
              style={{ color: 'var(--text-muted)' }}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-5 py-4 overflow-y-auto max-h-[calc(80vh-130px)]">
            <div className="space-y-4">
              {/* Title */}
              <div>
                <label className="label block mb-1.5">{t.nodes.title}</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={t.nodes.titlePlaceholder}
                  className="input"
                  disabled={saving}
                  autoFocus
                />
              </div>

              {/* Node Type (create only) */}
              {!isEditing && availableNodeTypes.length > 1 && (
                <div>
                  <label className="label block mb-1.5">{t.nodes.type}</label>
                  <select
                    value={nodeType}
                    onChange={(e) => setNodeType(e.target.value)}
                    className="input"
                    disabled={saving}
                  >
                    {availableNodeTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Properties */}
              <div>
                <label className="label block mb-1.5">{t.nodes.properties}</label>
                {properties.length > 0 && (
                  <div className="space-y-2 mb-2">
                    {properties.map((prop, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={prop.key}
                          onChange={(e) => updateProperty(index, 'key', e.target.value)}
                          placeholder={t.nodes.propertyKey}
                          className="input flex-1"
                          disabled={saving}
                        />
                        <input
                          type="text"
                          value={prop.value}
                          onChange={(e) => updateProperty(index, 'value', e.target.value)}
                          placeholder={t.nodes.propertyValue}
                          className="input flex-1"
                          disabled={saving}
                        />
                        <button
                          type="button"
                          onClick={() => removeProperty(index)}
                          className="flex-shrink-0 w-7 h-7 rounded flex items-center justify-center transition-colors"
                          style={{ color: 'var(--text-muted)' }}
                          disabled={saving}
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <button
                  type="button"
                  onClick={addProperty}
                  disabled={saving}
                  className="flex items-center gap-1.5 text-xs transition-colors"
                  style={{ color: 'var(--text-muted)' }}
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                  </svg>
                  {t.nodes.addProperty}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <p className="text-xs mt-2" style={{ color: 'var(--error)' }}>
                {error}
              </p>
            )}

            {/* Actions */}
            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={() => !saving && onClose()}
                disabled={saving}
                className="btn btn-secondary flex-1 text-sm"
              >
                {t.nodes.cancel}
              </button>
              <button
                type="submit"
                disabled={saving || !title.trim()}
                className="btn btn-primary flex-1 text-sm disabled:opacity-40"
              >
                {saving ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    {t.nodes.saving}
                  </span>
                ) : (
                  t.nodes.save
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}
