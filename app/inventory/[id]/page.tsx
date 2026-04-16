'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'
import { ArrowLeft } from 'lucide-react'

export default function EditProductPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [companies, setCompanies] = useState<{ id: string; name: string }[]>([])
  const [form, setForm] = useState({
    name: '',
    company_id: '',
    unit_type: 'pieces',
    unit_value: '',
    retail_price: '',
    current_stock: '',
    min_stock_level: '',
  })

  useEffect(() => {
    const load = async () => {
      const [{ data: product }, { data: cos }] = await Promise.all([
        supabase.from('products').select('*').eq('id', id).single(),
        supabase.from('companies').select('id, name').order('name'),
      ])
      if (product) {
        setForm({
          name: product.name,
          company_id: product.company_id || '',
          unit_type: product.unit_type,
          unit_value: product.unit_value?.toString() || '',
          retail_price: product.retail_price.toString(),
          current_stock: product.current_stock.toString(),
          min_stock_level: product.min_stock_level.toString(),
        })
      }
      setCompanies(cos || [])
      setLoading(false)
    }
    load()
  }, [id])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const { error } = await supabase
      .from('products')
      .update({
        name: form.name,
        company_id: form.company_id || null,
        unit_type: form.unit_type as any,
        unit_value: form.unit_value ? Number(form.unit_value) : null,
        retail_price: Number(form.retail_price),
        current_stock: Number(form.current_stock),
        min_stock_level: Number(form.min_stock_level),
      })
      .eq('id', id)
    setSaving(false)
    if (error) return toast.error(error.message)
    toast.success('Updated')
    router.push('/inventory')
  }

  if (loading) {
    return (
      <div className="page-container">
        <div className="flex justify-center py-12">
          <div className="spinner w-10 h-10" />
        </div>
      </div>
    )
  }

  return (
    <div className="page-container max-w-2xl">
      <Link href="/inventory" className="flex items-center gap-2 text-sm text-gray-600 mb-4 hover:text-gray-900">
        <ArrowLeft size={16} /> Back
      </Link>
      <h1 className="text-2xl font-bold mb-6">Edit Product</h1>

      <form onSubmit={submit} className="card space-y-4">
        <div className="form-group">
          <label className="form-label">Name</label>
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
            <option value="">-- None --</option>
            {companies.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="form-group">
            <label className="form-label">Unit Type</label>
            <select
              className="input"
              value={form.unit_type}
              onChange={(e) => setForm({ ...form, unit_type: e.target.value })}
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
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Retail Price</label>
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
            {saving ? 'Saving...' : 'Update'}
          </button>
          <Link href="/inventory" className="btn-secondary">Cancel</Link>
        </div>
      </form>
    </div>
  )
}
