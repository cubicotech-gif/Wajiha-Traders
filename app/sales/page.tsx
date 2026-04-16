'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils'
import { Plus } from 'lucide-react'
import toast from 'react-hot-toast'

type Sale = {
  id: string
  bill_number: string | null
  sale_date: string
  net_amount: number
  status: string
  payment_type: string
  customers: { name: string; shop_name: string | null } | null
}

export default function SalesPage() {
  const [sales, setSales] = useState<Sale[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'paid'>('all')

  useEffect(() => {
    load()
  }, [])

  const load = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('sales')
      .select('id, bill_number, sale_date, net_amount, status, payment_type, customers(name, shop_name)')
      .order('created_at', { ascending: false })
    if (error) toast.error('Failed to load')
    setSales((data as any) || [])
    setLoading(false)
  }

  const filtered = filter === 'all' ? sales : sales.filter((s) => s.status === filter)

  return (
    <div className="page-container">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Sales</h1>
        <Link href="/sales/new" className="btn-primary flex items-center gap-2">
          <Plus size={18} /> New Sale
        </Link>
      </div>

      <div className="flex gap-2 mb-4">
        {(['all', 'pending', 'paid'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              filter === f ? 'bg-primary-600 text-white' : 'bg-white border border-gray-200 text-gray-700'
            }`}
          >
            {f[0].toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="spinner w-10 h-10" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="card empty-state">
          <p className="text-gray-500">No sales yet</p>
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Bill #</th>
                <th>Date</th>
                <th>Customer</th>
                <th>Amount</th>
                <th>Payment</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr key={s.id}>
                  <td className="font-medium">{s.bill_number || '-'}</td>
                  <td>{formatDate(s.sale_date)}</td>
                  <td>{s.customers?.shop_name || s.customers?.name || 'Walk-in'}</td>
                  <td className="font-semibold">{formatCurrency(s.net_amount)}</td>
                  <td className="capitalize">{s.payment_type}</td>
                  <td>
                    <span className={`badge ${getStatusColor(s.status)}`}>{s.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
