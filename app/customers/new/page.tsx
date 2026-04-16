'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'
import { ArrowLeft } from 'lucide-react'

export default function NewCustomerPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: '',
    shop_name: '',
    phone: '',
    address: '',
    credit_limit: '0',
  })

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name) return toast.error('Name is required')
    setSaving(true)
    const { error } = await supabase.from('customers').insert({
      name: form.name,
      shop_name: form.shop_name || null,
      phone: form.phone || null,
      address: form.address || null,
      credit_limit: Number(form.credit_limit) || 0,
    })
    setSaving(false)
    if (error) return toast.error(error.message)
    toast.success('Customer added')
    router.push('/customers')
  }

  return (
    <div className="page-container max-w-2xl">
      <Link href="/customers" className="flex items-center gap-2 text-sm text-gray-600 mb-4 hover:text-gray-900">
        <ArrowLeft size={16} /> Back
      </Link>
      <h1 className="text-2xl font-bold mb-6">Add Customer</h1>

      <form onSubmit={submit} className="card space-y-4">
        <div className="form-group">
          <label className="form-label">Name *</label>
          <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        </div>
        <div className="form-group">
          <label className="form-label">Shop / Mart Name</label>
          <input className="input" value={form.shop_name} onChange={(e) => setForm({ ...form, shop_name: e.target.value })} />
        </div>
        <div className="form-group">
          <label className="form-label">Phone</label>
          <input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="0300-1234567" />
        </div>
        <div className="form-group">
          <label className="form-label">Address</label>
          <textarea className="input" rows={2} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
        </div>
        <div className="form-group">
          <label className="form-label">Credit Limit (PKR)</label>
          <input type="number" className="input" value={form.credit_limit} onChange={(e) => setForm({ ...form, credit_limit: e.target.value })} />
        </div>
        <div className="flex gap-3 pt-2">
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? 'Saving...' : 'Save'}
          </button>
          <Link href="/customers" className="btn-secondary">Cancel</Link>
        </div>
      </form>
    </div>
  )
}
