'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'
import { ArrowLeft } from 'lucide-react'

export default function NewProductPage() {
  const router = useRouter()
  const [companies, setCompanies] = useState<{ id: string; name: string }[]>([])
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: '',
    company_id: '',
    unit_type: 'pieces' as const,
    unit_value: '',
    retail_price: '',
    current_stock: '0',
    min_stock_level: '10',
  })

  useEffect(() => {
    supabase
      .from('companies')
      .select('id, name')
      .order('name')
      .then(({ data }) => setCompanies(data || []))
  }, [])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.retail_price) {
      return toast.error('Name and price required')
    }
    setSaving(true)
    const { error } = await supabase.from('products').insert({
      name: form.name,
      company_id: form.company_id || null,
      unit_type: form.unit_type,
      unit_value: form.unit_value ? Number(form.unit_value) : null,
      retail_price: Number(form.retail_price),
      current_stock: Number(form.current_stock) || 0,
      min_stock_level: Number(form.min_stock_level) || 10,
    })
    setSaving(false)
    if (error) return toast.error(error.message)
    toast.success('Product added')
    router.push('/inventory')
  }

  return (
    <div className="page-container max-w-2xl">
      <Link href="/inventory" className="flex items-center gap-2 text-sm text-gray-600 mb-4 hover:text-gray-900">
        <ArrowLeft size={16} /> Back
      </Link>
      <h1 className="text-2xl font-bold mb-6">Add Product</h1>

      <form onSubmit={submit} className="card space-y-4">
        <div className="form-group">
          <label className="form-label">Product Name *</label>
          <input
            className="input"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Company</label>
          <select
            className="input"
            value={form.company_id}
            onChange={(e) => setForm({ ...form, company_id: e.target.value })}
          >
            <option value="">-- Select --</option>
            {companies.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="form-group">
            <label className="form-label">Unit Type</label>
            <select
              className="input"
              value={form.unit_type}
              onChange={(e) => setForm({ ...form, unit_type: e.target.value as any })}
            >
              <option value="pieces">pieces</option>
              <option value="cartons">cartons</option>
              <option value="gm">gm</option>
              <option value="kg">kg</option>
              <option value="ml">ml</option>
              <option value="liter">liter</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Unit Value</label>
            <input
              type="number"
              step="0.01"
              className="input"
              value={form.unit_value}
              onChange={(e) => setForm({ ...form, unit_value: e.target.value })}
              placeholder="e.g. 250"
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Retail Price (PKR) *</label>
          <input
            type="number"
            step="0.01"
            className="input"
            value={form.retail_price}
            onChange={(e) => setForm({ ...form, retail_price: e.target.value })}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="form-group">
            <label className="form-label">Current Stock</label>
            <input
              type="number"
              step="0.01"
              className="input"
              value={form.current_stock}
              onChange={(e) => setForm({ ...form, current_stock: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Min Stock Level</label>
            <input
              type="number"
              step="0.01"
              className="input"
              value={form.min_stock_level}
              onChange={(e) => setForm({ ...form, min_stock_level: e.target.value })}
            />
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? 'Saving...' : 'Save Product'}
          </button>
          <Link href="/inventory" className="btn-secondary">Cancel</Link>
        </div>
      </form>
    </div>
  )
}
