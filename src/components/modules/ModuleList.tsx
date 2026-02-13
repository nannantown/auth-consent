'use client'

import { useState, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { useI18n } from '@/lib/i18n'
import { getNodeTypeSchemas, deleteNodeTypeSchema } from '@/lib/graph'
import type { NodeTypeSchema } from '@/types/graph'
import { ModuleFormModal } from './ModuleFormModal'

interface ModuleListProps {
  userId: string
  onSchemasChange?: (schemas: NodeTypeSchema[]) => void
}

export function ModuleList({ userId, onSchemasChange }: ModuleListProps) {
  const { t, language } = useI18n()
  const [schemas, setSchemas] = useState<NodeTypeSchema[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingSchema, setEditingSchema] = useState<NodeTypeSchema | undefined>(undefined)
  const [deletingSchema, setDeletingSchema] = useState<NodeTypeSchema | null>(null)

  const loadSchemas = useCallback(async () => {
    const data = await getNodeTypeSchemas(userId)
    setSchemas(data)
    onSchemasChange?.(data)
    setLoading(false)
  }, [userId, onSchemasChange])

  useEffect(() => {
    loadSchemas()
  }, [loadSchemas])

  const handleDelete = async () => {
    if (!deletingSchema) return
    const success = await deleteNodeTypeSchema(deletingSchema.id)
    if (success) {
      setDeletingSchema(null)
      loadSchemas()
    }
  }

  const handleOpenCreate = () => {
    setEditingSchema(undefined)
    setShowForm(true)
  }

  const handleOpenEdit = (schema: NodeTypeSchema) => {
    setEditingSchema(schema)
    setShowForm(true)
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditingSchema(undefined)
  }

  const handleSaved = () => {
    handleCloseForm()
    loadSchemas()
  }

  const systemSchemas = schemas.filter((s) => s.is_system)
  const customSchemas = schemas.filter((s) => !s.is_system)

  const getFieldCount = (schema: NodeTypeSchema): number => {
    const s = schema.schema as { properties?: Record<string, unknown> }
    return s?.properties ? Object.keys(s.properties).length : 0
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3
          className="text-sm font-medium"
          style={{ color: 'var(--text-primary)' }}
        >
          {t.modules.title}
        </h3>
        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-1.5 text-xs transition-colors"
          style={{ color: 'var(--text-muted)' }}
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
          </svg>
          {t.modules.addModule}
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div
            className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin"
            style={{ borderColor: 'var(--text-muted)', borderTopColor: 'transparent' }}
          />
        </div>
      ) : (
        <div className="space-y-2">
          {/* System modules */}
          {systemSchemas.map((schema) => (
            <div
              key={schema.id}
              className="card px-4 py-3"
            >
              <div className="flex items-center gap-3">
                {schema.icon && (
                  <span className="text-sm flex-shrink-0">{schema.icon}</span>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className="text-sm font-medium truncate"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {language === 'en' && schema.display_name_en
                        ? schema.display_name_en
                        : schema.display_name}
                    </span>
                    <span
                      className="text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full flex-shrink-0"
                      style={{
                        background: 'rgba(255, 255, 255, 0.06)',
                        color: 'var(--text-muted)',
                      }}
                    >
                      {t.modules.systemModule}
                    </span>
                  </div>
                  <p
                    className="text-xs mt-0.5"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {schema.node_type} · {getFieldCount(schema)} fields
                  </p>
                </div>
              </div>
            </div>
          ))}

          {/* Custom modules */}
          {customSchemas.map((schema) => (
            <div
              key={schema.id}
              className="card-interactive px-4 py-3"
            >
              <div className="flex items-center gap-3">
                {schema.icon && (
                  <span className="text-sm flex-shrink-0">{schema.icon}</span>
                )}
                <div className="flex-1 min-w-0">
                  <span
                    className="text-sm font-medium truncate block"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {language === 'en' && schema.display_name_en
                      ? schema.display_name_en
                      : schema.display_name}
                  </span>
                  <p
                    className="text-xs mt-0.5"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {schema.node_type} · {getFieldCount(schema)} fields
                  </p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => handleOpenEdit(schema)}
                    className="w-7 h-7 rounded flex items-center justify-center transition-colors"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setDeletingSchema(schema)}
                    className="w-7 h-7 rounded flex items-center justify-center transition-colors"
                    style={{ color: 'var(--error)' }}
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* Empty state for custom modules */}
          {customSchemas.length === 0 && (
            <p
              className="text-xs text-center py-4"
              style={{ color: 'var(--text-muted)' }}
            >
              {t.modules.noModules}
            </p>
          )}
        </div>
      )}

      {/* Form Modal */}
      <ModuleFormModal
        isOpen={showForm}
        onClose={handleCloseForm}
        onSaved={handleSaved}
        schema={editingSchema}
        userId={userId}
      />

      {/* Delete Confirmation Modal */}
      {deletingSchema && createPortal(
        <>
          <div
            className="fixed inset-0 z-40 bg-black/70"
            onClick={() => setDeletingSchema(null)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="relative w-full max-w-sm animate-scale-in"
              style={{
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-md)',
              }}
            >
              <div className="p-5">
                <p
                  className="text-sm font-medium text-center mb-2"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {t.modules.deleteConfirm}
                </p>
                <p
                  className="text-xs text-center mb-5"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {deletingSchema.display_name}
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setDeletingSchema(null)}
                    className="btn btn-secondary flex-1 text-sm"
                  >
                    {t.modules.cancel}
                  </button>
                  <button
                    onClick={handleDelete}
                    className="btn btn-danger flex-1 text-sm"
                  >
                    {t.modules.deleteModule}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>,
        document.body
      )}
    </div>
  )
}
