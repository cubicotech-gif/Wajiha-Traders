'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { formatCurrency, formatDate, getPaymentTypeColor } from '@/lib/utils'
import { Plus } from 'lucide-react'
import toast from 'react-hot-toast'

type Purchase = {
  id: string
  purchase_date: string
  net_amount: number
  paid_amount: number
  remaining_balance: number
  payment_type: string
  vendors: { name: string } | null
}

export default function PurchasesPage() {
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    load()
  }, [])

  const load = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('purchases')
      .select('id, purchase_date, net_amount, paid_amount, remaining_balance, payment_type, vendors(name)')
      .order('purchase_date', { ascending: false })
    if (error) toast.error('Failed to load')
    setPurchases((data as any) || [])
    setLoading(false)
  }

  return (
    <div className="page-container">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Purchases</h1>
        <Link href="/purchases/new" className="btn-primary flex items-center gap-2">
          <Plus size={18} /> New Purchase
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="spinner w-10 h-10" />
        </div>
      ) : purchases.length === 0 ? (
        <div className="card empty-state">
          <p className="text-gray-500">No purchases yet</p>
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Vendor</th>
                <th>Net Amount</th>
                <th>Paid</th>
                <th>Remaining</th>
                <th>Payment</th>
              </tr>
            </thead>
            <tbody>
              {purchases.map((p) => (
                <tr key={p.id}>
                  <td>{formatDate(p.purchase_date)}</td>
                  <td className="font-medium">{p.vendors?.name || '-'}</td>
                  <td className="font-semibold">{formatCurrency(p.net_amount)}</td>
                  <td>{formatCurrency(p.paid_amount)}</td>
                  <td className={p.remaining_balance > 0 ? 'text-danger-600' : ''}>
                    {formatCurrency(p.remaining_balance)}
                  </td>
                  <td>
                    <span className={`badge ${getPaymentTypeColor(p.payment_type)}`}>
                      {p.payment_type}
                    </span>
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
