'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { formatCurrency, formatPhone } from '@/lib/utils'
import { Plus, Search } from 'lucide-react'
import toast from 'react-hot-toast'

type Vendor = {
  id: string
  name: string
  phone: string | null
  default_discount_percent: number
  outstanding_balance: number
}

export default function VendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    load()
  }, [])

  const load = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('vendors')
      .select('id, name, phone, default_discount_percent, outstanding_balance')
      .order('name')
    if (error) toast.error('Failed to load')
    setVendors(data || [])
    setLoading(false)
  }

  const remove = async (id: string) => {
    if (!confirm('Delete this vendor?')) return
    const { error } = await supabase.from('vendors').delete().eq('id', id)
    if (error) return toast.error('Delete failed')
    toast.success('Deleted')
    load()
  }

  const filtered = vendors.filter((v) =>
    v.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="page-container">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Vendors</h1>
        <Link href="/vendors/new" className="btn-primary flex items-center gap-2">
          <Plus size={18} /> Add Vendor
        </Link>
      </div>

      <div className="card mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search vendors..."
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
          <p className="text-gray-500">No vendors found</p>
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Phone</th>
                <th>Default Discount</th>
                <th>Outstanding</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((v) => (
                <tr key={v.id}>
                  <td className="font-medium">{v.name}</td>
                  <td>{v.phone ? formatPhone(v.phone) : '-'}</td>
                  <td>{v.default_discount_percent}%</td>
                  <td className={v.outstanding_balance > 0 ? 'text-danger-600 font-medium' : ''}>
                    {formatCurrency(v.outstanding_balance)}
                  </td>
                  <td>
                    <button onClick={() => remove(v.id)} className="text-danger-600 hover:underline text-sm">
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
