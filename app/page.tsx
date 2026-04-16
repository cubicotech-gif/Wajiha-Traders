'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { formatCurrency, isLowStock } from '@/lib/utils'
import Link from 'next/link'
import {
  Package,
  ShoppingCart,
  Users,
  TrendingUp,
  AlertTriangle,
  FileText,
} from 'lucide-react'

type RecentSale = {
  id: string
  bill_number: string | null
  sale_date: string
  net_amount: number
  status: string
  customers: { name: string; shop_name: string | null } | null
}

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    lowStockProducts: 0,
    totalCustomers: 0,
    totalVendors: 0,
    todaySales: 0,
    totalReceivables: 0,
    totalPayables: 0,
  })
  const [loading, setLoading] = useState(true)
  const [recentSales, setRecentSales] = useState<RecentSale[]>([])

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      const { count: productsCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })

      // Fetch stock levels and compare client-side (PostgREST can't compare two columns directly)
      const { data: products } = await supabase
        .from('products')
        .select('current_stock, min_stock_level')

      const lowStock =
        products?.filter((p) =>
          isLowStock(p.current_stock || 0, p.min_stock_level || 0)
        ).length || 0

      const { count: customersCount } = await supabase
        .from('customers')
        .select('*', { count: 'exact', head: true })

      const { count: vendorsCount } = await supabase
        .from('vendors')
        .select('*', { count: 'exact', head: true })

      const today = new Date().toISOString().split('T')[0]
      const { data: todaySalesData } = await supabase
        .from('sales')
        .select('net_amount')
        .eq('sale_date', today)

      const todaySalesTotal =
        todaySalesData?.reduce(
          (sum, sale) => sum + (sale.net_amount || 0),
          0
        ) || 0

      const { data: receivablesData } = await supabase
        .from('customers')
        .select('outstanding_balance')

      const totalReceivables =
        receivablesData?.reduce(
          (sum, c) => sum + (c.outstanding_balance || 0),
          0
        ) || 0

      const { data: payablesData } = await supabase
        .from('vendors')
        .select('outstanding_balance')

      const totalPayables =
        payablesData?.reduce(
          (sum, v) => sum + (v.outstanding_balance || 0),
          0
        ) || 0

      const { data: recentSalesData } = await supabase
        .from('sales')
        .select('id, bill_number, sale_date, net_amount, status, customers(name, shop_name)')
        .order('created_at', { ascending: false })
        .limit(5)

      setStats({
        totalProducts: productsCount || 0,
        lowStockProducts: lowStock,
        totalCustomers: customersCount || 0,
        totalVendors: vendorsCount || 0,
        todaySales: todaySalesTotal,
        totalReceivables,
        totalPayables,
      })

      setRecentSales((recentSalesData as any) || [])
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
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 text-sm">Welcome to Wajeeha Traders</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <Link href="/inventory" className="stat-card">
          <div className="stat-icon bg-primary-100 text-primary-600 mb-2">
            <Package size={20} />
          </div>
          <div className="text-xl font-bold">{stats.totalProducts}</div>
          <div className="text-xs text-gray-600">Products</div>
        </Link>

        <Link href="/inventory" className="stat-card">
          <div className="stat-icon bg-warning-100 text-warning-600 mb-2">
            <AlertTriangle size={20} />
          </div>
          <div className="text-xl font-bold">{stats.lowStockProducts}</div>
          <div className="text-xs text-gray-600">Low Stock</div>
        </Link>

        <Link href="/customers" className="stat-card">
          <div className="stat-icon bg-success-100 text-success-600 mb-2">
            <Users size={20} />
          </div>
          <div className="text-xl font-bold">{stats.totalCustomers}</div>
          <div className="text-xs text-gray-600">Customers</div>
        </Link>

        <Link href="/vendors" className="stat-card">
          <div className="stat-icon bg-primary-100 text-primary-600 mb-2">
            <ShoppingCart size={20} />
          </div>
          <div className="text-xl font-bold">{stats.totalVendors}</div>
          <div className="text-xs text-gray-600">Vendors</div>
        </Link>
      </div>

      {/* Money row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
        <div className="card">
          <div className="flex items-center gap-2 mb-1 text-gray-600 text-sm">
            <TrendingUp size={16} /> Today&apos;s Sales
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {formatCurrency(stats.todaySales)}
          </div>
        </div>
        <Link href="/accounts/receivables" className="card hover:border-primary-300">
          <div className="text-gray-600 text-sm mb-1">Receivables</div>
          <div className="text-2xl font-bold text-success-600">
            {formatCurrency(stats.totalReceivables)}
          </div>
        </Link>
        <Link href="/accounts/payables" className="card hover:border-primary-300">
          <div className="text-gray-600 text-sm mb-1">Payables</div>
          <div className="text-2xl font-bold text-danger-600">
            {formatCurrency(stats.totalPayables)}
          </div>
        </Link>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <Link href="/sales/new" className="btn-primary text-center">
          New Sale
        </Link>
        <Link href="/purchases/new" className="btn-secondary text-center">
          New Purchase
        </Link>
        <Link href="/inventory/new" className="btn-secondary text-center">
          Add Product
        </Link>
        <Link href="/accounts/dsr" className="btn-outline text-center">
          View DSR
        </Link>
      </div>

      {/* Recent Sales */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Recent Sales</h2>
          <Link href="/sales" className="text-sm text-primary-600 hover:underline">
            View All
          </Link>
        </div>

        {recentSales.length === 0 ? (
          <div className="empty-state">
            <FileText size={40} className="text-gray-300 mb-2" />
            <p className="text-gray-500 text-sm">No sales yet</p>
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
                    <td className="font-medium">{sale.bill_number || '-'}</td>
                    <td>
                      {sale.customers?.shop_name ||
                        sale.customers?.name ||
                        'Walk-in'}
                    </td>
                    <td>{new Date(sale.sale_date).toLocaleDateString()}</td>
                    <td className="font-semibold">
                      {formatCurrency(sale.net_amount)}
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          sale.status === 'paid'
                            ? 'bg-success-100 text-success-700'
                            : sale.status === 'pending'
                            ? 'bg-warning-100 text-warning-700'
                            : 'bg-primary-100 text-primary-700'
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
