'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { formatCurrency, formatPhone } from '@/lib/utils'
import { Plus, Search } from 'lucide-react'
import toast from 'react-hot-toast'

type Customer = {
  id: string
  name: string
  shop_name: string | null
  phone: string | null
  credit_limit: number
  outstanding_balance: number
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    load()
  }, [])

  const load = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('customers')
      .select('id, name, shop_name, phone, credit_limit, outstanding_balance')
      .order('name')
    if (error) toast.error('Failed to load')
    setCustomers(data || [])
    setLoading(false)
  }

  const remove = async (id: string) => {
    if (!confirm('Delete this customer?')) return
    const { error } = await supabase.from('customers').delete().eq('id', id)
    if (error) return toast.error('Delete failed')
    toast.success('Deleted')
    load()
  }

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.shop_name || '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="page-container">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Customers</h1>
        <Link href="/customers/new" className="btn-primary flex items-center gap-2">
          <Plus size={18} /> Add Customer
        </Link>
      </div>

      <div className="card mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search customers..."
            className="input pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="spinner w-10 h-10" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="card empty-state">
          <p className="text-gray-500">No customers found</p>
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Shop</th>
                <th>Phone</th>
                <th>Credit Limit</th>
                <th>Outstanding</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id}>
                  <td className="font-medium">{c.name}</td>
                  <td>{c.shop_name || '-'}</td>
                  <td>{c.phone ? formatPhone(c.phone) : '-'}</td>
                  <td>{formatCurrency(c.credit_limit)}</td>
                  <td className={c.outstanding_balance > 0 ? 'text-danger-600 font-medium' : ''}>
                    {formatCurrency(c.outstanding_balance)}
                  </td>
                  <td>
                    <button onClick={() => remove(c.id)} className="text-danger-600 hover:underline text-sm">
                      Delete
                    </button>
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
