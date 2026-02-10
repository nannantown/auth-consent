'use client'

import { useI18n } from '@/lib/i18n'

interface NodeTypeFilterProps {
  nodeTypes: string[]
  selectedType: string | null
  onSelect: (type: string | null) => void
}

export function NodeTypeFilter({ nodeTypes, selectedType, onSelect }: NodeTypeFilterProps) {
  const { t } = useI18n()

  if (nodeTypes.length <= 1) return null

  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onSelect(null)}
        className={`pill-filter ${selectedType === null ? 'pill-filter-active' : ''}`}
      >
        {t.nodes.all}
      </button>
      {nodeTypes.map((type) => (
        <button
          key={type}
          onClick={() => onSelect(type)}
          className={`pill-filter ${selectedType === type ? 'pill-filter-active' : ''}`}
        >
          {type}
        </button>
      ))}
    </div>
  )
}
