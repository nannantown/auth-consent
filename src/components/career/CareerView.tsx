'use client'

import { useState, useEffect, useCallback } from 'react'
import type { User } from '@supabase/supabase-js'
import type { Category } from '@/types/category'
import type { Node, Category as GraphCategory } from '@/types/graph'
import {
  getCategoryBySlug as getGraphCategoryBySlug,
  createCategory as createGraphCategory,
  getCategoryWithNodes,
  createNode,
  updateNode,
  deleteNode,
} from '@/lib/graph'
import { getTemplateBySlug } from '@/types/graph'
import { useI18n } from '@/lib/i18n'
import { CareerStats } from './CareerStats'
import { WorkExperienceTimeline } from './WorkExperienceTimeline'
import { SkillCard } from './SkillCard'
import { SkillForm } from './SkillForm'
import { SkillRadar } from './SkillRadar'
import { ConfirmDialog } from '@ground/ui'

interface CareerViewProps {
  user: User
  categorySlug: string
  category: Category
  language: string
}

type Tab = 'timeline' | 'skills'

export function CareerView({ user, categorySlug, category, language }: CareerViewProps) {
  const { t: i18n } = useI18n()
  const ct = i18n.career
  const [activeTab, setActiveTab] = useState<Tab>('timeline')
  const [graphCategory, setGraphCategory] = useState<GraphCategory | null>(null)
  const [nodes, setNodes] = useState<Node[]>([])
  const [loading, setLoading] = useState(true)
  const [showSkillForm, setShowSkillForm] = useState(false)
  const [editingSkillId, setEditingSkillId] = useState<string | null>(null)
  const [deletingSkillId, setDeletingSkillId] = useState<string | null>(null)

  const template = getTemplateBySlug(categorySlug)
  const workExperiences = nodes.filter((n) => n.node_type === 'WorkExperience')
  const skills = nodes.filter((n) => n.node_type === 'Skill')
  const loadData = useCallback(async () => {
    try {
      let cat = await getGraphCategoryBySlug(user.id, categorySlug)
      if (!cat && template) {
        cat = await createGraphCategory(user.id, {
          slug: template.slug,
          name: template.name,
          name_en: template.name_en,
          icon: template.icon,
          color: template.color,
          description: template.description,
          template_slug: template.slug,
        })
      }
      if (cat) {
        setGraphCategory(cat)
        const result = await getCategoryWithNodes(cat.id)
        if (result) {
          setNodes(result.nodes)
        }
      }
    } catch (error) {
      console.error('Failed to load career data:', error)
    } finally {
      setLoading(false)
    }
  }, [user.id, categorySlug, template])

  // eslint-disable-next-line react-hooks/set-state-in-effect -- initial data fetch
  useEffect(() => { loadData() }, [loadData])

  // Work Experience CRUD
  const handleAddWorkExperience = async (data: { title: string; properties: Record<string, unknown> }) => {
    const node = await createNode(user.id, {
      category_id: graphCategory!.id,
      node_type: 'WorkExperience',
      title: data.title,
      properties: data.properties,
    })
    if (node) {
      setNodes((prev) => [...prev, node])
    }
  }

  const handleEditWorkExperience = async (nodeId: string, data: { title: string; properties: Record<string, unknown> }) => {
    const updated = await updateNode(nodeId, {
      title: data.title,
      properties: data.properties,
    })
    if (updated) {
      setNodes((prev) => prev.map((n) => (n.id === nodeId ? updated : n)))
    }
  }

  const handleDeleteWorkExperience = async (nodeId: string) => {
    const success = await deleteNode(nodeId)
    if (success) {
      setNodes((prev) => prev.filter((n) => n.id !== nodeId))
    }
  }

  // Skill CRUD
  const handleAddSkill = async (data: { title: string; properties: Record<string, unknown> }) => {
    const node = await createNode(user.id, {
      category_id: graphCategory!.id,
      node_type: 'Skill',
      title: data.title,
      properties: data.properties,
    })
    if (node) {
      setNodes((prev) => [...prev, node])
      setShowSkillForm(false)
    }
  }

  const handleEditSkill = async (data: { title: string; properties: Record<string, unknown> }) => {
    if (!editingSkillId) return
    const updated = await updateNode(editingSkillId, {
      title: data.title,
      properties: data.properties,
    })
    if (updated) {
      setNodes((prev) => prev.map((n) => (n.id === editingSkillId ? updated : n)))
      setEditingSkillId(null)
    }
  }

  const handleDeleteSkill = async () => {
    if (!deletingSkillId) return
    const success = await deleteNode(deletingSkillId)
    if (success) {
      setNodes((prev) => prev.filter((n) => n.id !== deletingSkillId))
      setDeletingSkillId(null)
    }
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: 'timeline', label: ct.tabTimeline },
    { key: 'skills', label: ct.tabSkills },
  ]

  const handleScrollToCategory = (category: string) => {
    const el = document.getElementById(`skill-category-${category.toLowerCase()}`)
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="rounded-xl p-4 skeleton"
              style={{ height: 88 }}
            />
          ))}
        </div>
        <div className="skeleton rounded-2xl" style={{ height: 300 }} />
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Career Stats */}
      <CareerStats
        workExperiences={workExperiences}
        skills={skills}
        language={language}
      />

      {/* Tab Navigation */}
      <div className="flex gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={activeTab === tab.key ? 'pill-filter-active' : 'pill-filter'}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'timeline' && (
        <WorkExperienceTimeline
          nodes={workExperiences}
          onAdd={handleAddWorkExperience}
          onEdit={handleEditWorkExperience}
          onDelete={handleDeleteWorkExperience}
          language={language}
        />
      )}

      {activeTab === 'skills' && (
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            background: 'var(--bg-translucent)',
            border: '1px solid var(--border-subtle)',
            backdropFilter: 'blur(12px)',
          }}
        >
          {/* Header */}
          <div
            className="px-6 py-4 flex items-center justify-between"
            style={{ borderBottom: '1px solid var(--border-subtle)' }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: 'rgba(59, 130, 246, 0.15)' }}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: '#3b82f6' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                {ct.tabSkills}
              </h3>
              <span
                className="text-xs px-2 py-0.5 rounded-full"
                style={{
                  background: 'var(--bg-surface-hover)',
                  color: 'var(--text-muted)',
                }}
              >
                {skills.length}
              </span>
            </div>
            <button
              onClick={() => setShowSkillForm(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors hover:bg-white/10"
              style={{ color: '#3b82f6' }}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              {ct.addSkill}
            </button>
          </div>

          {/* Skill Radar */}
          {skills.length > 0 && (
            <div className="mb-4 px-4 pt-4">
              <SkillRadar skills={skills} onCategoryClick={handleScrollToCategory} />
            </div>
          )}

          {/* Skills Content */}
          <div className="p-4">
            {skills.length === 0 && !showSkillForm ? (
              <div
                className="text-center py-8 rounded-xl"
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px dashed var(--border-default)',
                }}
              >
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  {ct.noSkills}
                </p>
                <button
                  onClick={() => setShowSkillForm(true)}
                  className="mt-2 text-sm font-medium"
                  style={{ color: '#3b82f6' }}
                >
                  {ct.addFirstSkill}
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {showSkillForm && (
                  <SkillForm
                    onSave={handleAddSkill}
                    onCancel={() => setShowSkillForm(false)}
                    language={language}
                  />
                )}

                {/* Group skills by category */}
                {(() => {
                  const categories = new Map<string, Node[]>()
                  for (const skill of skills) {
                    const cat = (skill.properties as { category?: string }).category || 'Other'
                    if (!categories.has(cat)) categories.set(cat, [])
                    categories.get(cat)!.push(skill)
                  }

                  return Array.from(categories.entries()).map(([cat, catSkills]) => (
                    <div key={cat} id={`skill-category-${cat.toLowerCase()}`}>
                      <div className="flex items-center gap-2 mb-2">
                        <span
                          className="text-xs font-medium uppercase tracking-wider"
                          style={{ color: 'var(--text-muted)' }}
                        >
                          {ct.categories[cat as keyof typeof ct.categories] || cat}
                        </span>
                        <span
                          className="text-xs px-1.5 py-0.5 rounded"
                          style={{
                            background: 'var(--bg-surface-hover)',
                            color: 'var(--text-muted)',
                          }}
                        >
                          {catSkills.length}
                        </span>
                      </div>
                      <div className="space-y-2">
                        {catSkills.map((skill) =>
                          editingSkillId === skill.id ? (
                            <SkillForm
                              key={skill.id}
                              node={skill}
                              onSave={handleEditSkill}
                              onCancel={() => setEditingSkillId(null)}
                              language={language}
                            />
                          ) : (
                            <SkillCard
                              key={skill.id}
                              node={skill}
                              onEdit={() => setEditingSkillId(skill.id)}
                              onDelete={() => setDeletingSkillId(skill.id)}
                              language={language}
                            />
                          )
                        )}
                      </div>
                    </div>
                  ))
                })()}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Delete Skill Confirmation */}
      <ConfirmDialog
        open={!!deletingSkillId}
        onClose={() => setDeletingSkillId(null)}
        onConfirm={handleDeleteSkill}
        title={ct.deleteSkill}
        message={ct.deleteSkillConfirm}
        confirmLabel={ct.deleteSkill}
        cancelLabel={i18n.dashboard.cancel}
        variant="danger"
      />
    </div>
  )
}
