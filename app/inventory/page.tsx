'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { formatCurrency, formatUnit, isLowStock } from '@/lib/utils'
import { Plus, Search, AlertTriangle } from 'lucide-react'
import toast from 'react-hot-toast'

type Product = {
  id: string
  name: string
  unit_type: string
  unit_value: number | null
  retail_price: number
  current_stock: number
  min_stock_level: number
  companies: { name: string } | null
}

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    load()
  }, [])

  const load = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('products')
      .select('id, name, unit_type, unit_value, retail_price, current_stock, min_stock_level, companies(name)')
      .order('name')
    if (error) toast.error('Failed to load products')
    setProducts((data as any) || [])
    setLoading(false)
  }

  const remove = async (id: string) => {
    if (!confirm('Delete this product?')) return
    const { error } = await supabase.from('products').delete().eq('id', id)
    if (error) return toast.error('Delete failed')
    toast.success('Deleted')
    load()
  }

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="page-container">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Inventory</h1>
        <Link href="/inventory/new" className="btn-primary flex items-center gap-2">
          <Plus size={18} /> Add Product
        </Link>
      </div>

      <div className="card mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search products..."
            className="input pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="spinner w-10 h-10" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="card empty-state">
          <p className="text-gray-500">No products found</p>
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Company</th>
                <th>Unit</th>
                <th>Price</th>
                <th>Stock</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => {
                const low = isLowStock(p.current_stock, p.min_stock_level)
                return (
                  <tr key={p.id}>
                    <td className="font-medium">{p.name}</td>
                    <td>{p.companies?.name || '-'}</td>
                    <td>{formatUnit(p.unit_type, p.unit_value)}</td>
                    <td>{formatCurrency(p.retail_price)}</td>
                    <td>
                      <span className={low ? 'text-danger-600 font-medium flex items-center gap-1' : ''}>
                        {low && <AlertTriangle size={14} />}
                        {p.current_stock}
                      </span>
                    </td>
                    <td className="flex gap-2">
                      <Link href={`/inventory/${p.id}`} className="text-primary-600 hover:underline text-sm">
                        Edit
                      </Link>
                      <button onClick={() => remove(p.id)} className="text-danger-600 hover:underline text-sm">
                        Delete
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
