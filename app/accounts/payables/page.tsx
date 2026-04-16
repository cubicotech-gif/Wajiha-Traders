'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { formatCurrency, formatPhone } from '@/lib/utils'

type Vendor = {
  id: string
  name: string
  phone: string | null
  outstanding_balance: number
}

export default function PayablesPage() {
  const [rows, setRows] = useState<Vendor[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from('vendors')
        .select('id, name, phone, outstanding_balance')
        .gt('outstanding_balance', 0)
        .order('outstanding_balance', { ascending: false })
      setRows(data || [])
      setLoading(false)
    }
    load()
  }, [])

  const total = rows.reduce((s, r) => s + r.outstanding_balance, 0)

  return (
    <div className="page-container">
      <h1 className="text-2xl font-bold mb-2">Payables</h1>
      <p className="text-gray-600 text-sm mb-6">Vendors you owe money to</p>

      <div className="card mb-4">
        <div className="text-sm text-gray-600">Total To Pay</div>
        <div className="text-3xl font-bold text-danger-600">{formatCurrency(total)}</div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="spinner w-10 h-10" /></div>
      ) : rows.length === 0 ? (
        <div className="card empty-state">
          <p className="text-gray-500">No outstanding payables</p>
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Vendor</th>
                <th>Phone</th>
                <th>Outstanding</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td className="font-medium">{r.name}</td>
                  <td>{r.phone ? formatPhone(r.phone) : '-'}</td>
                  <td className="font-semibold text-danger-600">
                    {formatCurrency(r.outstanding_balance)}
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
