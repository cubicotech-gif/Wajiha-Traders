'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { formatCurrency, formatDate } from '@/lib/utils'

type Sale = {
  id: string
  bill_number: string | null
  net_amount: number
  paid_amount: number
  remaining_balance: number
  payment_type: string
  customers: { name: string; shop_name: string | null } | null
}

export default function DSRPage() {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [sales, setSales] = useState<Sale[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    load()
  }, [date])

  const load = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('sales')
      .select('id, bill_number, net_amount, paid_amount, remaining_balance, payment_type, customers(name, shop_name)')
      .eq('sale_date', date)
      .order('created_at', { ascending: false })
    setSales((data as any) || [])
    setLoading(false)
  }

  const totalSales = sales.reduce((s, x) => s + x.net_amount, 0)
  const totalPaid = sales.reduce((s, x) => s + x.paid_amount, 0)
  const totalRemaining = sales.reduce((s, x) => s + x.remaining_balance, 0)
  const cashSales = sales.filter((s) => s.payment_type === 'cash').reduce((s, x) => s + x.net_amount, 0)
  const creditSales = sales.filter((s) => s.payment_type === 'credit').reduce((s, x) => s + x.net_amount, 0)

  return (
    <div className="page-container">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
        <h1 className="text-2xl font-bold">Daily Sales Report</h1>
        <input
          type="date"
          className="input max-w-xs"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="card">
          <div className="text-xs text-gray-600 mb-1">Total Sales</div>
          <div className="text-xl font-bold">{formatCurrency(totalSales)}</div>
        </div>
        <div className="card">
          <div className="text-xs text-gray-600 mb-1">Cash Sales</div>
          <div className="text-xl font-bold text-success-600">{formatCurrency(cashSales)}</div>
        </div>
        <div className="card">
          <div className="text-xs text-gray-600 mb-1">Credit Sales</div>
          <div className="text-xl font-bold text-warning-600">{formatCurrency(creditSales)}</div>
        </div>
        <div className="card">
          <div className="text-xs text-gray-600 mb-1">Outstanding</div>
          <div className="text-xl font-bold text-danger-600">{formatCurrency(totalRemaining)}</div>
        </div>
      </div>

      <div className="card">
        <h2 className="font-semibold mb-4">Sales on {formatDate(date)}</h2>
        {loading ? (
          <div className="flex justify-center py-8"><div className="spinner w-8 h-8" /></div>
        ) : sales.length === 0 ? (
          <p className="text-gray-500 text-center py-6">No sales on this date</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Bill #</th>
                  <th>Customer</th>
                  <th>Net</th>
                  <th>Paid</th>
                  <th>Remaining</th>
                  <th>Type</th>
                </tr>
              </thead>
              <tbody>
                {sales.map((s) => (
                  <tr key={s.id}>
                    <td className="font-medium">{s.bill_number || '-'}</td>
                    <td>{s.customers?.shop_name || s.customers?.name || 'Walk-in'}</td>
                    <td>{formatCurrency(s.net_amount)}</td>
                    <td>{formatCurrency(s.paid_amount)}</td>
                    <td className={s.remaining_balance > 0 ? 'text-danger-600' : ''}>
                      {formatCurrency(s.remaining_balance)}
                    </td>
                    <td className="capitalize">{s.payment_type}</td>
                  </tr>
                ))}
                <tr className="font-bold bg-gray-50">
                  <td colSpan={2}>Total</td>
                  <td>{formatCurrency(totalSales)}</td>
                  <td>{formatCurrency(totalPaid)}</td>
                  <td>{formatCurrency(totalRemaining)}</td>
                  <td></td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
