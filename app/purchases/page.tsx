'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { formatCurrency, formatDate, getPaymentTypeColor } from '@/lib/utils'
import Link from 'next/link'
import { ShoppingCart, Plus, Search } from 'lucide-react'
import toast from 'react-hot-toast'
import type { Purchase } from '@/lib/types'

export default function PurchasesPage() {
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    loadPurchases()
  }, [])

  const loadPurchases = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('purchases')
        .select(`
          *,
          vendors (
            id,
            name
          )
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setPurchases((data as Purchase[]) || [])
    } catch (error) {
      console.error('Error loading purchases:', error)
      toast.error('Failed to load purchases')
    } finally {
      setLoading(false)
    }
  }

  const filteredPurchases = purchases.filter((purchase) =>
    purchase.vendors?.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const stats = {
    total: purchases.length,
    totalAmount: purchases.reduce((sum, p) => sum + p.net_amount, 0),
    totalPending: purchases.reduce((sum, p) => sum + p.remaining_balance, 0),
  }

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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Purchases</h1>
          <p className="text-gray-600">Manage all your purchase orders</p>
        </div>
        <Link href="/purchases/new" className="btn-primary flex items-center gap-2">
          <Plus size={20} />
          <span className="hidden sm:inline">New Purchase</span>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <div className="card">
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          <div className="text-sm text-gray-600">Total Purchases</div>
        </div>
        <div className="card">
          <div className="text-2xl font-bold text-primary-600">{formatCurrency(stats.totalAmount)}</div>
          <div className="text-sm text-gray-600">Total Value</div>
        </div>
        <div className="card col-span-2 md:col-span-1">
          <div className="text-2xl font-bold text-warning-600">{formatCurrency(stats.totalPending)}</div>
          <div className="text-sm text-gray-600">Pending Payments</div>
        </div>
      </div>

      {/* Search */}
      <div className="card mb-6">
        <div className="relative">
          <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by vendor..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input pl-10 w-full"
          />
        </div>
      </div>

      {/* Purchases List */}
      {filteredPurchases.length === 0 ? (
        <div className="empty-state">
          <ShoppingCart size={48} className="text-gray-300 mb-4" />
          <p className="text-gray-500">
            {searchQuery ? 'No purchases found' : 'No purchases yet'}
          </p>
          {!searchQuery && (
            <Link href="/purchases/new" className="btn-primary mt-4">
              Create Your First Purchase
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredPurchases.map((purchase) => (
            <div key={purchase.id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-semibold text-gray-900">
                      {purchase.vendors?.name || 'Unknown Vendor'}
                    </span>
                    <span className={`badge ${getPaymentTypeColor(purchase.payment_type)}`}>
                      {purchase.payment_type}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-3">
                    <div>
                      <div className="text-xs text-gray-500">Date</div>
                      <div className="font-medium">{formatDate(purchase.purchase_date)}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Amount</div>
                      <div className="font-medium text-primary-600">{formatCurrency(purchase.net_amount)}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Paid</div>
                      <div className="font-medium text-success-600">{formatCurrency(purchase.paid_amount)}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Balance</div>
                      <div className={`font-medium ${purchase.remaining_balance > 0 ? 'text-warning-600' : 'text-gray-600'}`}>
                        {formatCurrency(purchase.remaining_balance)}
                      </div>
                    </div>
                  </div>

                  {purchase.notes && (
                    <p className="text-sm text-gray-600 mt-2">{purchase.notes}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
