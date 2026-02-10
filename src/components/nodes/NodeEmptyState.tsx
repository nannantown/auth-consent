'use client'

import { useI18n } from '@/lib/i18n'

interface NodeEmptyStateProps {
  onAdd: () => void
}

export function NodeEmptyState({ onAdd }: NodeEmptyStateProps) {
  const { t } = useI18n()

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <svg
        className="w-12 h-12 mb-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        style={{ color: 'var(--text-muted)', opacity: 0.3, strokeWidth: 1.5 }}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
        />
      </svg>
      <p
        className="text-sm mb-1"
        style={{ color: 'var(--text-secondary)' }}
      >
        {t.nodes.noNodes}
      </p>
      <p
        className="text-xs mb-4"
        style={{ color: 'var(--text-muted)' }}
      >
        {t.nodes.noNodesDescription}
      </p>
      <button
        onClick={onAdd}
        className="btn btn-primary text-sm px-4 py-2"
      >
        {t.nodes.addNode}
      </button>
    </div>
  )
}
