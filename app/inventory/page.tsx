'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { formatCurrency, formatUnit, isLowStock } from '@/lib/utils'
import Link from 'next/link'
import { Package, Plus, Search, AlertTriangle, Edit2, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import type { Product } from '@/lib/types'

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState<'all' | 'low-stock'>('all')

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          companies (
            id,
            name
          )
        `)
        .order('name')

      if (error) throw error
      setProducts((data as Product[]) || [])
    } catch (error) {
      console.error('Error loading products:', error)
      toast.error('Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id)

      if (error) throw error

      toast.success('Product deleted successfully')
      loadProducts()
    } catch (error) {
      console.error('Error deleting product:', error)
      toast.error('Failed to delete product')
    }
  }

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = filter === 'all' || isLowStock(product.current_stock, product.min_stock_level)
    return matchesSearch && matchesFilter
  })

  const lowStockCount = products.filter((p) => isLowStock(p.current_stock, p.min_stock_level)).length

  if (loading) {
    return (
      <div className="page-container">
        <div className="flex items-center justify-center h-96">
          <div className="spinner w-12 h-12"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="page-container">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Inventory</h1>
          <p className="text-gray-600">Manage your products and stock levels</p>
        </div>
        <Link href="/inventory/new" className="btn-primary flex items-center gap-2">
          <Plus size={20} />
          <span className="hidden sm:inline">Add Product</span>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <div className="card">
          <div className="text-2xl font-bold text-gray-900">{products.length}</div>
          <div className="text-sm text-gray-600">Total Products</div>
        </div>
        <div className="card">
          <div className="text-2xl font-bold text-warning-600">{lowStockCount}</div>
          <div className="text-sm text-gray-600">Low Stock Items</div>
        </div>
        <div className="card col-span-2 md:col-span-1">
          <div className="text-2xl font-bold text-primary-600">
            {formatCurrency(products.reduce((sum, p) => sum + (p.retail_price * p.current_stock), 0))}
          </div>
          <div className="text-sm text-gray-600">Total Value</div>
        </div>
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pl-10 w-full"
            />
          </div>

          {/* Filter */}
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-outline'}`}
            >
              All ({products.length})
            </button>
            <button
              onClick={() => setFilter('low-stock')}
              className={`btn ${filter === 'low-stock' ? 'btn-primary' : 'btn-outline'} flex items-center gap-1`}
            >
              <AlertTriangle size={16} />
              Low Stock ({lowStockCount})
            </button>
          </div>
        </div>
      </div>

      {/* Products List */}
      {filteredProducts.length === 0 ? (
        <div className="empty-state">
          <Package size={48} className="text-gray-300 mb-4" />
          <p className="text-gray-500">
            {searchQuery ? 'No products found' : 'No products yet'}
          </p>
          {!searchQuery && (
            <Link href="/inventory/new" className="btn-primary mt-4">
              Add Your First Product
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredProducts.map((product) => {
            const lowStock = isLowStock(product.current_stock, product.min_stock_level)

            return (
              <div key={product.id} className="card hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900">{product.name}</h3>
                      {lowStock && (
                        <span className="badge bg-warning-100 text-warning-800 flex items-center gap-1">
                          <AlertTriangle size={12} />
                          Low Stock
                        </span>
                      )}
                    </div>

                    {product.companies && (
                      <p className="text-sm text-gray-600 mb-2">{product.companies.name}</p>
                    )}

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-3">
                      <div>
                        <div className="text-xs text-gray-500">Unit</div>
                        <div className="font-medium">{formatUnit(product.unit_type, product.unit_value)}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Price</div>
                        <div className="font-medium text-primary-600">{formatCurrency(product.retail_price)}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">In Stock</div>
                        <div className={`font-medium ${lowStock ? 'text-warning-600' : 'text-success-600'}`}>
                          {product.current_stock}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Min Level</div>
                        <div className="font-medium">{product.min_stock_level}</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Link
                      href={`/inventory/edit/${product.id}`}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <Edit2 size={18} className="text-gray-600" />
                    </Link>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={18} className="text-red-600" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
