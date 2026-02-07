'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { formatCurrency } from '@/lib/utils'
import Link from 'next/link'
import {
  Package,
  ShoppingCart,
  Users,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Calendar,
  FileText,
} from 'lucide-react'

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    lowStockProducts: 0,
    totalCustomers: 0,
    totalVendors: 0,
    todaySales: 0,
    pendingSales: 0,
    totalReceivables: 0,
    totalPayables: 0,
  })
  const [loading, setLoading] = useState(true)
  const [recentSales, setRecentSales] = useState<any[]>([])

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      // Get products count
      const { count: productsCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })

      // Get low stock products
      const { data: lowStockData } = await supabase
        .from('products')
        .select('current_stock, min_stock_level')
        .lte('current_stock', 'min_stock_level')

      // Get customers count
      const { count: customersCount } = await supabase
        .from('customers')
        .select('*', { count: 'exact', head: true })

      // Get vendors count
      const { count: vendorsCount } = await supabase
        .from('vendors')
        .select('*', { count: 'exact', head: true })

      // Get today's sales
      const today = new Date().toISOString().split('T')[0]
      const { data: todaySalesData } = await supabase
        .from('sales')
        .select('net_amount')
        .eq('sale_date', today) as { data: { net_amount: number }[] | null }

      const todaySalesTotal = todaySalesData?.reduce(
        (sum, sale) => sum + (sale.net_amount || 0),
        0
      ) || 0

      // Get pending sales count
      const { count: pendingSalesCount } = await supabase
        .from('sales')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending')

      // Get total receivables
      const { data: receivablesData } = await supabase
        .from('customers')
        .select('outstanding_balance')

      const totalReceivables = receivablesData?.reduce(
        (sum, customer) => sum + (customer.outstanding_balance || 0),
        0
      ) || 0

      // Get total payables
      const { data: payablesData } = await supabase
        .from('vendors')
        .select('outstanding_balance')

      const totalPayables = payablesData?.reduce(
        (sum, vendor) => sum + (vendor.outstanding_balance || 0),
        0
      ) || 0

      // Get recent sales
      const { data: recentSalesData } = await supabase
        .from('sales')
        .select(`
          *,
          customers (name, shop_name)
        `)
        .order('created_at', { ascending: false })
        .limit(5)

      setStats({
        totalProducts: productsCount || 0,
        lowStockProducts: lowStockData?.length || 0,
        totalCustomers: customersCount || 0,
        totalVendors: vendorsCount || 0,
        todaySales: todaySalesTotal,
        pendingSales: pendingSalesCount || 0,
        totalReceivables,
        totalPayables,
      })
      
      setRecentSales(recentSalesData || [])
    } catch (error) {
      console.error('Error loading dashboard:', error)
    } finally {
      setLoading(false)
    }
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Welcome to Wajeeha Traders Management System</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-8">
        {/* Total Products */}
        <Link href="/inventory" className="stat-card group">
          <div className="flex items-center justify-between mb-3">
            <div className="stat-icon bg-primary-100 text-primary-600 group-hover:bg-primary-600 group-hover:text-white transition-colors">
              <Package size={24} />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {stats.totalProducts}
          </div>
          <div className="text-sm text-gray-600">Total Products</div>
        </Link>

        {/* Low Stock */}
        <Link href="/inventory?filter=low-stock" className="stat-card group">
          <div className="flex items-center justify-between mb-3">
            <div className="stat-icon bg-warning-100 text-warning-600 group-hover:bg-warning-600 group-hover:text-white transition-colors">
              <AlertTriangle size={24} />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {stats.lowStockProducts}
          </div>
          <div className="text-sm text-gray-600">Low Stock Items</div>
        </Link>

        {/* Customers */}
        <Link href="/customers" className="stat-card group">
          <div className="flex items-center justify-between mb-3">
            <div className="stat-icon bg-success-100 text-success-600 group-hover:bg-success-600 group-hover:text-white transition-colors">
              <Users size={24} />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {stats.totalCustomers}
          </div>
          <div className="text-sm text-gray-600">Customers</div>
        </Link>

        {/* Vendors */}
        <Link href="/vendors" className="stat-card group">
          <div className="flex items-center justify-between mb-3">
            <div className="stat-icon bg-purple-100 text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors">
              <ShoppingCart size={24} />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {stats.totalVendors}
          </div>
          <div className="text-sm text-gray-600">Vendors</div>
        </Link>

        {/* Today's Sales */}
        <div className="stat-card col-span-2">
          <div className="flex items-center justify-between mb-3">
            <div className="stat-icon bg-green-100 text-green-600">
              <TrendingUp size={24} />
            </div>
            <Link
              href="/accounts/dsr"
              className="text-xs text-primary-600 hover:underline"
            >
              View DSR →
            </Link>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">
            {formatCurrency(stats.todaySales)}
          </div>
          <div className="text-sm text-gray-600">Today's Sales</div>
        </div>

        {/* Pending Bills */}
        <Link href="/sales?status=pending" className="stat-card">
          <div className="flex items-center justify-between mb-3">
            <div className="stat-icon bg-orange-100 text-orange-600">
              <Calendar size={24} />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {stats.pendingSales}
          </div>
          <div className="text-sm text-gray-600">Pending Bills</div>
        </Link>

        {/* Receivables */}
        <Link href="/accounts/receivables" className="stat-card">
          <div className="flex items-center justify-between mb-3">
            <div className="stat-icon bg-blue-100 text-blue-600">
              <DollarSign size={24} />
            </div>
          </div>
          <div className="text-xl font-bold text-gray-900 mb-1">
            {formatCurrency(stats.totalReceivables)}
          </div>
          <div className="text-sm text-gray-600">To Receive</div>
        </Link>

        {/* Payables */}
        <Link href="/accounts/payables" className="stat-card">
          <div className="flex items-center justify-between mb-3">
            <div className="stat-icon bg-red-100 text-red-600">
              <DollarSign size={24} />
            </div>
          </div>
          <div className="text-xl font-bold text-gray-900 mb-1">
            {formatCurrency(stats.totalPayables)}
          </div>
          <div className="text-sm text-gray-600">To Pay</div>
        </Link>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Link
          href="/sales/new"
          className="btn-primary flex items-center justify-center gap-2 py-4"
        >
          <FileText size={20} />
          <span>New Sale</span>
        </Link>
        <Link
          href="/purchases/new"
          className="btn-secondary flex items-center justify-center gap-2 py-4"
        >
          <ShoppingCart size={20} />
          <span>New Purchase</span>
        </Link>
        <Link
          href="/sales/advance-bookings"
          className="btn-outline flex items-center justify-center gap-2 py-4"
        >
          <Calendar size={20} />
          <span>Bookings</span>
        </Link>
        <Link
          href="/accounts/dsr"
          className="btn-secondary flex items-center justify-center gap-2 py-4"
        >
          <TrendingUp size={20} />
          <span>DSR</span>
        </Link>
      </div>

      {/* Recent Sales */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Recent Sales</h2>
          <Link href="/sales" className="text-sm text-primary-600 hover:underline">
            View All →
          </Link>
        </div>

        {recentSales.length === 0 ? (
          <div className="empty-state">
            <FileText size={48} className="text-gray-300 mb-4" />
            <p className="text-gray-500">No sales yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Bill #</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentSales.map((sale) => (
                  <tr key={sale.id}>
                    <td className="font-medium">{sale.bill_number || 'N/A'}</td>
                    <td>
                      {sale.customers?.shop_name || sale.customers?.name || 'Walk-in'}
                    </td>
                    <td>{new Date(sale.sale_date).toLocaleDateString()}</td>
                    <td className="font-semibold">
                      {formatCurrency(sale.net_amount)}
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          sale.status === 'paid'
                            ? 'bg-green-100 text-green-800'
                            : sale.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {sale.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
