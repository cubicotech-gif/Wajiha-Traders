'use client'

import Link from 'next/link'
import { useStored, formatPKR, today } from '@/lib/storage'
import type { Product, Customer, Sale } from '@/lib/types'
import { Package, Users, FileText, AlertTriangle } from 'lucide-react'

export default function Dashboard() {
  const [products] = useStored<Product[]>('products', [])
  const [customers] = useStored<Customer[]>('customers', [])
  const [sales] = useStored<Sale[]>('sales', [])

  const lowStock = products.filter((p) => p.stock <= 10).length
  const todayStr = today()
  const todaySales = sales
    .filter((s) => s.date === todayStr)
    .reduce((sum, s) => sum + s.total, 0)
  const pending = sales
    .filter((s) => s.status === 'pending')
    .reduce((sum, s) => sum + (s.total - s.paid), 0)

  const stats = [
    { label: 'Products', value: products.length, icon: Package, color: 'bg-blue-100 text-blue-600', href: '/products' },
    { label: 'Low Stock', value: lowStock, icon: AlertTriangle, color: 'bg-amber-100 text-amber-600', href: '/products' },
    { label: 'Customers', value: customers.length, icon: Users, color: 'bg-green-100 text-green-600', href: '/customers' },
    { label: 'Sales', value: sales.length, icon: FileText, color: 'bg-purple-100 text-purple-600', href: '/sales' },
  ]

  const recent = [...sales].sort((a, b) => b.id.localeCompare(a.id)).slice(0, 5)

  return (
    <div className="page">
      <h1 className="text-2xl font-bold mb-1">Dashboard</h1>
      <p className="text-gray-600 text-sm mb-6">Welcome to Wajeeha Traders</p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {stats.map((s) => (
          <Link href={s.href} key={s.label} className="card hover:border-blue-300">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center mb-2 ${s.color}`}>
              <s.icon size={18} />
            </div>
            <div className="text-xl font-bold">{s.value}</div>
            <div className="text-xs text-gray-600">{s.label}</div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
        <div className="card">
          <div className="text-xs text-gray-600 mb-1">Today&apos;s Sales</div>
          <div className="text-2xl font-bold">{formatPKR(todaySales)}</div>
        </div>
        <div className="card">
          <div className="text-xs text-gray-600 mb-1">Outstanding</div>
          <div className="text-2xl font-bold text-red-600">{formatPKR(pending)}</div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-6">
        <Link href="/sales" className="btn-primary text-center">New Sale</Link>
        <Link href="/products" className="btn-secondary text-center">Add Product</Link>
        <Link href="/customers" className="btn-secondary text-center">Add Customer</Link>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold">Recent Sales</h2>
          <Link href="/sales" className="text-sm text-blue-600 hover:underline">View All</Link>
        </div>
        {recent.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-6">No sales yet</p>
        ) : (
          <div className="table-wrap">
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
                {recent.map((s) => (
                  <tr key={s.id}>
                    <td className="font-medium">{s.billNumber}</td>
                    <td>{s.customerName}</td>
                    <td>{s.date}</td>
                    <td className="font-semibold">{formatPKR(s.total)}</td>
                    <td>
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                          s.status === 'paid'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {s.status}
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
