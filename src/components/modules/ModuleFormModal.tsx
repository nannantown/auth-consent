'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useI18n } from '@/lib/i18n'
import { createNodeTypeSchema, updateNodeTypeSchema } from '@/lib/graph'
import type { NodeTypeSchema } from '@/types/graph'

interface SchemaField {
  name: string
  type: 'text' | 'number' | 'date' | 'boolean' | 'url'
  required: boolean
}

interface ModuleFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSaved: () => void
  schema?: NodeTypeSchema
  userId: string
}

const FIELD_TYPES = ['text', 'number', 'date', 'boolean', 'url'] as const

function parseSchemaFields(schema: Record<string, unknown>): SchemaField[] {
  const properties = (schema as { properties?: Record<string, { type?: string }> })?.properties
  const requiredList = (schema as { required?: string[] })?.required || []
  if (!properties) return []
  return Object.entries(properties).map(([name, def]) => ({
    name,
    type: (def?.type as SchemaField['type']) || 'text',
    required: requiredList.includes(name),
  }))
}

function buildSchema(fields: SchemaField[]): Record<string, unknown> {
  const properties: Record<string, { type: string }> = {}
  const required: string[] = []
  for (const field of fields) {
    if (!field.name.trim()) continue
    properties[field.name.trim()] = { type: field.type }
    if (field.required) {
      required.push(field.name.trim())
    }
  }
  return { properties, required }
}

export function ModuleFormModal({
  isOpen,
  onClose,
  onSaved,
  schema,
  userId,
}: ModuleFormModalProps) {
  const { t } = useI18n()
  const isEditing = !!schema

  const [displayName, setDisplayName] = useState('')
  const [displayNameEn, setDisplayNameEn] = useState('')
  const [icon, setIcon] = useState('')
  const [nodeType, setNodeType] = useState('')
  const [fields, setFields] = useState<SchemaField[]>([])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (isOpen) {
      if (schema) {
        setDisplayName(schema.display_name)
        setDisplayNameEn(schema.display_name_en || '')
        setIcon(schema.icon || '')
        setNodeType(schema.node_type)
        setFields(parseSchemaFields(schema.schema))
      } else {
        setDisplayName('')
        setDisplayNameEn('')
        setIcon('')
        setNodeType('')
        setFields([])
      }
    }
  }, [isOpen, schema])

  if (!isOpen) return null

  const addField = () => {
    setFields([...fields, { name: '', type: 'text', required: false }])
  }

  const removeField = (index: number) => {
    setFields(fields.filter((_, i) => i !== index))
  }

  const updateField = (index: number, updates: Partial<SchemaField>) => {
    const updated = [...fields]
    updated[index] = { ...updated[index], ...updates }
    setFields(updated)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!displayName.trim() || !nodeType.trim()) return

    setSaving(true)

    const schemaData = buildSchema(fields)

    try {
      if (isEditing && schema) {
        await updateNodeTypeSchema(schema.id, {
          display_name: displayName.trim(),
          display_name_en: displayNameEn.trim() || undefined,
          icon: icon.trim() || undefined,
          schema: schemaData,
        })
      } else {
        await createNodeTypeSchema(userId, {
          node_type: nodeType.trim(),
          display_name: displayName.trim(),
          display_name_en: displayNameEn.trim() || undefined,
          icon: icon.trim() || undefined,
          schema: schemaData,
        })
      }
      onSaved()
    } catch (err) {
      console.error('Failed to save module:', err)
    } finally {
      setSaving(false)
    }
  }

  const fieldTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      text: t.modules.text,
      number: t.modules.number,
      date: t.modules.date,
      boolean: t.modules.boolean,
      url: t.modules.url,
    }
    return labels[type] || type
  }

  return createPortal(
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
              {isEditing ? t.modules.editModule : t.modules.addModule}
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
              {/* Display Name */}
              <div>
                <label className="label block mb-1.5">{t.modules.moduleName}</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder={t.modules.moduleName}
                  className="input"
                  disabled={saving}
                  autoFocus
                />
              </div>

              {/* Display Name EN */}
              <div>
                <label className="label block mb-1.5">{t.modules.moduleNameEn}</label>
                <input
                  type="text"
                  value={displayNameEn}
                  onChange={(e) => setDisplayNameEn(e.target.value)}
                  placeholder={t.modules.moduleNameEn}
                  className="input"
                  disabled={saving}
                />
              </div>

              {/* Icon */}
              <div>
                <label className="label block mb-1.5">{t.modules.icon}</label>
                <input
                  type="text"
                  value={icon}
                  onChange={(e) => setIcon(e.target.value)}
                  placeholder="e.g. star"
                  className="input"
                  disabled={saving}
                />
              </div>

              {/* Node Type (create only) */}
              {!isEditing && (
                <div>
                  <label className="label block mb-1.5">{t.modules.moduleType}</label>
                  <input
                    type="text"
                    value={nodeType}
                    onChange={(e) => setNodeType(e.target.value)}
                    placeholder="e.g. CustomNote"
                    className="input"
                    disabled={saving}
                  />
                </div>
              )}

              {/* Schema Fields */}
              <div>
                <label className="label block mb-1.5">{t.modules.schema}</label>
                {fields.length > 0 && (
                  <div className="space-y-2 mb-2">
                    {fields.map((field, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={field.name}
                          onChange={(e) => updateField(index, { name: e.target.value })}
                          placeholder={t.modules.fieldName}
                          className="input flex-1"
                          disabled={saving}
                        />
                        <select
                          value={field.type}
                          onChange={(e) => updateField(index, { type: e.target.value as SchemaField['type'] })}
                          className="input"
                          style={{ width: '110px', flexShrink: 0 }}
                          disabled={saving}
                        >
                          {FIELD_TYPES.map((type) => (
                            <option key={type} value={type}>
                              {fieldTypeLabel(type)}
                            </option>
                          ))}
                        </select>
                        <label
                          className="flex items-center gap-1 flex-shrink-0 text-xs cursor-pointer"
                          style={{ color: 'var(--text-muted)' }}
                        >
                          <input
                            type="checkbox"
                            checked={field.required}
                            onChange={(e) => updateField(index, { required: e.target.checked })}
                            disabled={saving}
                            className="w-3.5 h-3.5"
                          />
                          <span className="hidden sm:inline">{t.modules.required}</span>
                        </label>
                        <button
                          type="button"
                          onClick={() => removeField(index)}
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
                  onClick={addField}
                  disabled={saving}
                  className="flex items-center gap-1.5 text-xs transition-colors"
                  style={{ color: 'var(--text-muted)' }}
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                  </svg>
                  {t.modules.addField}
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={() => !saving && onClose()}
                disabled={saving}
                className="btn btn-secondary flex-1 text-sm"
              >
                {t.modules.cancel}
              </button>
              <button
                type="submit"
                disabled={saving || !displayName.trim() || (!isEditing && !nodeType.trim())}
                className="btn btn-primary flex-1 text-sm disabled:opacity-40"
              >
                {saving ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  </span>
                ) : (
                  t.modules.save
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>,
    document.body
  )
}
