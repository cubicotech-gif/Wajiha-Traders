'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { formatCurrency, formatDate } from '@/lib/utils'
import { TrendingUp, Calendar } from 'lucide-react'
import toast from 'react-hot-toast'
import type { Sale } from '@/lib/types'

export default function DSRPage() {
  const [sales, setSales] = useState<Sale[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])

  useEffect(() => {
    loadDSR()
  }, [selectedDate])

  const loadDSR = async () => {
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
        .eq('sale_date', selectedDate)
        .order('created_at', { ascending: false })

      if (error) throw error
      setSales((data as Sale[]) || [])
    } catch (error) {
      console.error('Error loading DSR:', error)
      toast.error('Failed to load daily sales report')
    } finally {
      setLoading(false)
    }
  }

  const stats = {
    totalSales: sales.length,
    cashSales: sales.filter(s => s.payment_type === 'cash').length,
    creditSales: sales.filter(s => s.payment_type === 'credit').length,
    totalAmount: sales.reduce((sum, s) => sum + s.net_amount, 0),
    totalCashReceived: sales.reduce((sum, s) => sum + s.paid_amount, 0),
    totalCredit: sales.reduce((sum, s) => sum + s.remaining_balance, 0),
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
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Daily Sales Report (DSR)</h1>
        <p className="text-gray-600">View detailed sales report for any date</p>
      </div>

      {/* Date Selector */}
      <div className="card mb-6">
        <div className="flex items-center gap-3">
          <Calendar size={20} className="text-gray-400" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="input flex-1"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <div className="card">
          <div className="text-2xl font-bold text-gray-900">{stats.totalSales}</div>
          <div className="text-sm text-gray-600">Total Sales</div>
        </div>
        <div className="card">
          <div className="text-2xl font-bold text-green-600">{stats.cashSales}</div>
          <div className="text-sm text-gray-600">Cash Sales</div>
        </div>
        <div className="card col-span-2 md:col-span-1">
          <div className="text-2xl font-bold text-orange-600">{stats.creditSales}</div>
          <div className="text-sm text-gray-600">Credit Sales</div>
        </div>
        <div className="card">
          <div className="text-xl font-bold text-primary-600">{formatCurrency(stats.totalAmount)}</div>
          <div className="text-sm text-gray-600">Total Amount</div>
        </div>
        <div className="card">
          <div className="text-xl font-bold text-success-600">{formatCurrency(stats.totalCashReceived)}</div>
          <div className="text-sm text-gray-600">Cash Received</div>
        </div>
        <div className="card">
          <div className="text-xl font-bold text-warning-600">{formatCurrency(stats.totalCredit)}</div>
          <div className="text-sm text-gray-600">Credit Given</div>
        </div>
      </div>

      {/* Sales List */}
      {sales.length === 0 ? (
        <div className="empty-state">
          <TrendingUp size={48} className="text-gray-300 mb-4" />
          <p className="text-gray-500">No sales on {formatDate(selectedDate)}</p>
        </div>
      ) : (
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Sales Details</h2>
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Bill #</th>
                  <th>Customer</th>
                  <th>Type</th>
                  <th className="text-right">Amount</th>
                  <th className="text-right">Paid</th>
                  <th className="text-right">Balance</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {sales.map((sale) => (
                  <tr key={sale.id}>
                    <td className="font-medium">{sale.bill_number || 'N/A'}</td>
                    <td>{sale.customers?.shop_name || sale.customers?.name || 'Walk-in'}</td>
                    <td>
                      <span className={`badge ${sale.payment_type === 'cash' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}`}>
                        {sale.payment_type}
                      </span>
                    </td>
                    <td className="text-right font-medium">{formatCurrency(sale.net_amount)}</td>
                    <td className="text-right text-success-600">{formatCurrency(sale.paid_amount)}</td>
                    <td className="text-right text-warning-600">{formatCurrency(sale.remaining_balance)}</td>
                    <td>
                      <span className={`badge ${sale.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {sale.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="font-bold border-t-2">
                  <td colSpan={3}>Total</td>
                  <td className="text-right">{formatCurrency(stats.totalAmount)}</td>
                  <td className="text-right text-success-600">{formatCurrency(stats.totalCashReceived)}</td>
                  <td className="text-right text-warning-600">{formatCurrency(stats.totalCredit)}</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
