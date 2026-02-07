'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function NewVendorPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    default_discount_percent: '0',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name) {
      toast.error('Please enter vendor name')
      return
    }

    setLoading(true)

    try {
      const { error } = await supabase.from('vendors').insert({
        name: formData.name,
        phone: formData.phone || null,
        address: formData.address || null,
        default_discount_percent: parseFloat(formData.default_discount_percent),
        outstanding_balance: 0,
      })

      if (error) throw error

      toast.success('Vendor added successfully')
      router.push('/vendors')
    } catch (error) {
      console.error('Error adding vendor:', error)
      toast.error('Failed to add vendor')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-container">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link href="/vendors" className="text-primary-600 hover:underline flex items-center gap-2 mb-4">
            <ArrowLeft size={20} />
            Back to Vendors
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Add New Vendor</h1>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="card">
          <div className="space-y-4">
            {/* Vendor Name */}
            <div>
              <label className="label">
                Vendor Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input"
                required
              />
            </div>

            {/* Phone */}
            <div>
              <label className="label">Phone Number</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="input"
                placeholder="03XX-XXXXXXX"
              />
            </div>

            {/* Address */}
            <div>
              <label className="label">Address</label>
              <textarea
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="input"
                rows={3}
              />
            </div>

            {/* Default Discount */}
            <div>
              <label className="label">Default Discount (%)</label>
              <input
                type="number"
                step="0.01"
                value={formData.default_discount_percent}
                onChange={(e) => setFormData({ ...formData, default_discount_percent: e.target.value })}
                className="input"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-6">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex-1"
            >
              {loading ? 'Adding...' : 'Add Vendor'}
            </button>
            <Link href="/vendors" className="btn-outline">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
