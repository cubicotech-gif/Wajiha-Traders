'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function NewCustomerPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    shop_name: '',
    phone: '',
    address: '',
    credit_limit: '0',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name) {
      toast.error('Please enter customer name')
      return
    }

    setLoading(true)

    try {
      const { error } = await supabase.from('customers').insert({
        name: formData.name,
        shop_name: formData.shop_name || undefined,
        phone: formData.phone || undefined,
        address: formData.address || undefined,
        credit_limit: parseFloat(formData.credit_limit),
        outstanding_balance: 0,
      })

      if (error) throw error

      toast.success('Customer added successfully')
      router.push('/customers')
    } catch (error) {
      console.error('Error adding customer:', error)
      toast.error('Failed to add customer')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-container">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link href="/customers" className="text-primary-600 hover:underline flex items-center gap-2 mb-4">
            <ArrowLeft size={20} />
            Back to Customers
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Add New Customer</h1>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="card">
          <div className="space-y-4">
            {/* Customer Name */}
            <div>
              <label className="label">
                Customer Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input"
                required
              />
            </div>

            {/* Shop Name */}
            <div>
              <label className="label">Shop Name</label>
              <input
                type="text"
                value={formData.shop_name}
                onChange={(e) => setFormData({ ...formData, shop_name: e.target.value })}
                className="input"
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

            {/* Credit Limit */}
            <div>
              <label className="label">Credit Limit (PKR)</label>
              <input
                type="number"
                step="0.01"
                value={formData.credit_limit}
                onChange={(e) => setFormData({ ...formData, credit_limit: e.target.value })}
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
              {loading ? 'Adding...' : 'Add Customer'}
            </button>
            <Link href="/customers" className="btn-outline">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
