'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

type Company = {
  id: string
  name: string
}

export default function NewProductPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [companies, setCompanies] = useState<Company[]>([])
  const [formData, setFormData] = useState({
    name: '',
    company_id: '',
    unit_type: 'pieces' as 'gm' | 'ml' | 'pieces' | 'cartons' | 'kg' | 'liter',
    unit_value: '',
    retail_price: '',
    current_stock: '0',
    min_stock_level: '10',
  })

  useEffect(() => {
    loadCompanies()
  }, [])

  const loadCompanies = async () => {
    const { data } = await supabase
      .from('companies')
      .select('*')
      .order('name')
    if (data) setCompanies(data)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.retail_price) {
      toast.error('Please fill in all required fields')
      return
    }

    setLoading(true)

    try {
      const { error } = await supabase.from('products').insert({
        name: formData.name,
        company_id: formData.company_id || undefined,
        unit_type: formData.unit_type,
        unit_value: formData.unit_value ? parseFloat(formData.unit_value) : undefined,
        retail_price: parseFloat(formData.retail_price),
        current_stock: parseFloat(formData.current_stock),
        min_stock_level: parseFloat(formData.min_stock_level),
      })

      if (error) throw error

      toast.success('Product added successfully')
      router.push('/inventory')
    } catch (error) {
      console.error('Error adding product:', error)
      toast.error('Failed to add product')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-container">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link href="/inventory" className="text-primary-600 hover:underline flex items-center gap-2 mb-4">
            <ArrowLeft size={20} />
            Back to Inventory
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Add New Product</h1>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="card">
          <div className="space-y-4">
            {/* Product Name */}
            <div>
              <label className="label">
                Product Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input"
                required
              />
            </div>

            {/* Company */}
            <div>
              <label className="label">Company</label>
              <select
                value={formData.company_id}
                onChange={(e) => setFormData({ ...formData, company_id: e.target.value })}
                className="input"
              >
                <option value="">Select Company</option>
                {companies.map((company) => (
                  <option key={company.id} value={company.id}>
                    {company.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Unit Type & Value */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">
                  Unit Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.unit_type}
                  onChange={(e) => setFormData({ ...formData, unit_type: e.target.value as any })}
                  className="input"
                  required
                >
                  <option value="pieces">Pieces</option>
                  <option value="kg">Kilogram (kg)</option>
                  <option value="gm">Gram (gm)</option>
                  <option value="liter">Liter</option>
                  <option value="ml">Milliliter (ml)</option>
                  <option value="cartons">Cartons</option>
                </select>
              </div>

              <div>
                <label className="label">Unit Value</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.unit_value}
                  onChange={(e) => setFormData({ ...formData, unit_value: e.target.value })}
                  className="input"
                  placeholder="e.g., 500"
                />
              </div>
            </div>

            {/* Retail Price */}
            <div>
              <label className="label">
                Retail Price (PKR) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.retail_price}
                onChange={(e) => setFormData({ ...formData, retail_price: e.target.value })}
                className="input"
                required
              />
            </div>

            {/* Stock Levels */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Current Stock</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.current_stock}
                  onChange={(e) => setFormData({ ...formData, current_stock: e.target.value })}
                  className="input"
                />
              </div>

              <div>
                <label className="label">Minimum Stock Level</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.min_stock_level}
                  onChange={(e) => setFormData({ ...formData, min_stock_level: e.target.value })}
                  className="input"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-6">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex-1"
            >
              {loading ? 'Adding...' : 'Add Product'}
            </button>
            <Link href="/inventory" className="btn-outline">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
