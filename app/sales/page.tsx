'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils'
import Link from 'next/link'
import { FileText, Plus, Search, Filter } from 'lucide-react'
import toast from 'react-hot-toast'
import type { Sale } from '@/lib/types'

export default function SalesPage() {
  const [sales, setSales] = useState<Sale[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'delivered' | 'paid' | 'cancelled'>('all')

  useEffect(() => {
    loadSales()
  }, [])

  const loadSales = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('sales')
        .select(`
          *,
          customers (
            id,
            name,
            shop_name
          )
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setSales((data as Sale[]) || [])
    } catch (error) {
      console.error('Error loading sales:', error)
      toast.error('Failed to load sales')
    } finally {
      setLoading(false)
    }
  }

  const filteredSales = sales.filter((sale) => {
    const matchesSearch =
      sale.bill_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sale.customers?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sale.customers?.shop_name?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === 'all' || sale.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const stats = {
    total: sales.length,
    pending: sales.filter(s => s.status === 'pending').length,
    delivered: sales.filter(s => s.status === 'delivered').length,
    paid: sales.filter(s => s.status === 'paid').length,
    totalAmount: sales.reduce((sum, s) => sum + s.net_amount, 0),
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Sales</h1>
          <p className="text-gray-600">Manage all your sales and invoices</p>
        </div>
        <Link href="/sales/new" className="btn-primary flex items-center gap-2">
          <Plus size={20} />
          <span className="hidden sm:inline">New Sale</span>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="card">
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          <div className="text-sm text-gray-600">Total Sales</div>
        </div>
        <div className="card">
          <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          <div className="text-sm text-gray-600">Pending</div>
        </div>
        <div className="card">
          <div className="text-2xl font-bold text-green-600">{stats.paid}</div>
          <div className="text-sm text-gray-600">Paid</div>
        </div>
        <div className="card">
          <div className="text-2xl font-bold text-primary-600">{formatCurrency(stats.totalAmount)}</div>
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
              placeholder="Search by bill #, customer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pl-10 w-full"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="input w-full sm:w-auto"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="delivered">Delivered</option>
            <option value="paid">Paid</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Sales List */}
      {filteredSales.length === 0 ? (
        <div className="empty-state">
          <FileText size={48} className="text-gray-300 mb-4" />
          <p className="text-gray-500">
            {searchQuery || statusFilter !== 'all' ? 'No sales found' : 'No sales yet'}
          </p>
          {!searchQuery && statusFilter === 'all' && (
            <Link href="/sales/new" className="btn-primary mt-4">
              Create Your First Sale
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredSales.map((sale) => (
            <Link
              key={sale.id}
              href={`/sales/${sale.id}`}
              className="card hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-semibold text-gray-900">
                      {sale.bill_number || 'N/A'}
                    </span>
                    <span className={`badge ${getStatusColor(sale.status)}`}>
                      {sale.status}
                    </span>
                  </div>

                  <p className="text-sm text-gray-600 mb-3">
                    {sale.customers?.shop_name || sale.customers?.name || 'Walk-in Customer'}
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div>
                      <div className="text-xs text-gray-500">Date</div>
                      <div className="font-medium">{formatDate(sale.sale_date)}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Amount</div>
                      <div className="font-medium text-primary-600">{formatCurrency(sale.net_amount)}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Paid</div>
                      <div className="font-medium text-success-600">{formatCurrency(sale.paid_amount)}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Balance</div>
                      <div className={`font-medium ${sale.remaining_balance > 0 ? 'text-warning-600' : 'text-gray-600'}`}>
                        {formatCurrency(sale.remaining_balance)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
