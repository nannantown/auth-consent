'use client'

import { useState } from 'react'
import { Profile, ProfileInput, Gender } from '@/types/profile'
import { useI18n } from '@/lib/i18n'

interface BasicInfoFormProps {
  profile: Profile | null
  onSave: (data: Partial<ProfileInput>) => Promise<void>
  onCancel: () => void
}

const PREFECTURES = [
  '北海道', '青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県',
  '茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県',
  '新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県', '岐阜県',
  '静岡県', '愛知県', '三重県', '滋賀県', '京都府', '大阪府', '兵庫県',
  '奈良県', '和歌山県', '鳥取県', '島根県', '岡山県', '広島県', '山口県',
  '徳島県', '香川県', '愛媛県', '高知県', '福岡県', '佐賀県', '長崎県',
  '熊本県', '大分県', '宮崎県', '鹿児島県', '沖縄県',
]

const GENDERS: { value: Gender; label: string }[] = [
  { value: 'male', label: '男性' },
  { value: 'female', label: '女性' },
  { value: 'other', label: 'その他' },
  { value: 'prefer_not_to_say', label: '回答しない' },
]

export function BasicInfoForm({ profile, onSave, onCancel }: BasicInfoFormProps) {
  const { t } = useI18n()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    last_name: profile?.last_name || '',
    first_name: profile?.first_name || '',
    last_name_kana: profile?.last_name_kana || '',
    first_name_kana: profile?.first_name_kana || '',
    phone: profile?.phone || '',
    postal_code: profile?.postal_code || '',
    prefecture: profile?.prefecture || '',
    city: profile?.city || '',
    address_line1: profile?.address_line1 || '',
    address_line2: profile?.address_line2 || '',
    date_of_birth: profile?.date_of_birth || '',
    gender: profile?.gender || '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await onSave({
        ...formData,
        gender: formData.gender as Gender || null,
      })
    } finally {
      setLoading(false)
    }
  }

  const inputClass = "input"
  const selectClass = "input"

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Name Section */}
      <div>
        <h3 className="label mb-3">{t.profile?.name || 'Name'}</h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label mb-1 block">{t.profile?.lastName || 'Last Name'}</label>
            <input
              type="text"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              className={inputClass}
              placeholder="山田"
            />
          </div>
          <div>
            <label className="label mb-1 block">{t.profile?.firstName || 'First Name'}</label>
            <input
              type="text"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              className={inputClass}
              placeholder="太郎"
            />
          </div>
          <div>
            <label className="label mb-1 block">{t.profile?.lastNameKana || 'Last Name (Kana)'}</label>
            <input
              type="text"
              name="last_name_kana"
              value={formData.last_name_kana}
              onChange={handleChange}
              className={inputClass}
              placeholder="ヤマダ"
            />
          </div>
          <div>
            <label className="label mb-1 block">{t.profile?.firstNameKana || 'First Name (Kana)'}</label>
            <input
              type="text"
              name="first_name_kana"
              value={formData.first_name_kana}
              onChange={handleChange}
              className={inputClass}
              placeholder="タロウ"
            />
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div>
        <h3 className="label mb-3">{t.profile?.contact || 'Contact'}</h3>
        <div>
          <label className="label mb-1 block">{t.profile?.phone || 'Phone'}</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className={inputClass}
            placeholder="090-1234-5678"
          />
        </div>
      </div>

      {/* Address Section */}
      <div>
        <h3 className="label mb-3">{t.profile?.address || 'Address'}</h3>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label mb-1 block">{t.profile?.postalCode || 'Postal Code'}</label>
              <input
                type="text"
                name="postal_code"
                value={formData.postal_code}
                onChange={handleChange}
                className={inputClass}
                placeholder="123-4567"
              />
            </div>
            <div>
              <label className="label mb-1 block">{t.profile?.prefecture || 'Prefecture'}</label>
              <select
                name="prefecture"
                value={formData.prefecture}
                onChange={handleChange}
                className={selectClass}
              >
                <option value="">Select</option>
                {PREFECTURES.map(pref => (
                  <option key={pref} value={pref}>{pref}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="label mb-1 block">{t.profile?.city || 'City'}</label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              className={inputClass}
              placeholder="渋谷区"
            />
          </div>
          <div>
            <label className="label mb-1 block">{t.profile?.addressLine1 || 'Street Address'}</label>
            <input
              type="text"
              name="address_line1"
              value={formData.address_line1}
              onChange={handleChange}
              className={inputClass}
              placeholder="道玄坂1-2-3"
            />
          </div>
          <div>
            <label className="label mb-1 block">{t.profile?.addressLine2 || 'Building/Apt'}</label>
            <input
              type="text"
              name="address_line2"
              value={formData.address_line2}
              onChange={handleChange}
              className={inputClass}
              placeholder="ABCビル 101号室"
            />
          </div>
        </div>
      </div>

      {/* Basic Attributes Section */}
      <div>
        <h3 className="label mb-3">{t.profile?.basicAttributes || 'Basic Attributes'}</h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label mb-1 block">{t.profile?.dateOfBirth || 'Date of Birth'}</label>
            <input
              type="date"
              name="date_of_birth"
              value={formData.date_of_birth}
              onChange={handleChange}
              className={inputClass}
            />
          </div>
          <div>
            <label className="label mb-1 block">{t.profile?.gender || 'Gender'}</label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className={selectClass}
            >
              <option value="">Select</option>
              {GENDERS.map(g => (
                <option key={g.value} value={g.value}>{g.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div
        className="flex items-center justify-end gap-3 pt-4"
        style={{ borderTop: '1px solid var(--border-subtle)' }}
      >
        <button
          type="button"
          onClick={onCancel}
          className="btn btn-secondary text-sm"
        >
          {t.profile?.cancel || 'Cancel'}
        </button>
        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary text-sm"
        >
          {loading ? (t.profile?.saving || 'Saving...') : (t.profile?.save || 'Save')}
        </button>
      </div>
    </form>
  )
}
