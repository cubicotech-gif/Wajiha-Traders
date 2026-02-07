'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { formatCurrency, formatPhone } from '@/lib/utils'
import { DollarSign, Search } from 'lucide-react'
import toast from 'react-hot-toast'
import type { Database } from '@/lib/types'

type Vendor = Database['public']['Tables']['vendors']['Row']

export default function PayablesPage() {
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    loadPayables()
  }, [])

  const loadPayables = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('vendors')
        .select('*')
        .gt('outstanding_balance', 0)
        .order('outstanding_balance', { ascending: false })

      if (error) throw error
      setVendors(data || [])
    } catch (error) {
      console.error('Error loading payables:', error)
      toast.error('Failed to load payables')
    } finally {
      setLoading(false)
    }
  }

  const filteredVendors = vendors.filter((vendor) =>
    vendor.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const totalPayables = vendors.reduce((sum, v) => sum + v.outstanding_balance, 0)

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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Accounts Payable</h1>
        <p className="text-gray-600">Outstanding payments to vendors</p>
      </div>

      {/* Total */}
      <div className="card mb-6 bg-red-600 text-white">
        <div className="flex items-center gap-3 mb-2">
          <DollarSign size={24} />
          <span className="text-lg">Total Payables</span>
        </div>
        <div className="text-4xl font-bold">{formatCurrency(totalPayables)}</div>
        <div className="text-sm opacity-90 mt-1">{filteredVendors.length} vendors with outstanding balance</div>
      </div>

      {/* Search */}
      <div className="card mb-6">
        <div className="relative">
          <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search vendors..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input pl-10 w-full"
          />
        </div>
      </div>

      {/* Payables List */}
      {filteredVendors.length === 0 ? (
        <div className="empty-state">
          <DollarSign size={48} className="text-gray-300 mb-4" />
          <p className="text-gray-500">
            {searchQuery ? 'No vendors found' : 'No outstanding payables'}
          </p>
        </div>
      ) : (
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Vendor Balances</h2>
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Vendor Name</th>
                  <th>Phone</th>
                  <th>Address</th>
                  <th className="text-right">Default Discount</th>
                  <th className="text-right">Outstanding</th>
                </tr>
              </thead>
              <tbody>
                {filteredVendors.map((vendor) => (
                  <tr key={vendor.id}>
                    <td className="font-medium">{vendor.name}</td>
                    <td>{vendor.phone ? formatPhone(vendor.phone) : '-'}</td>
                    <td>{vendor.address || '-'}</td>
                    <td className="text-right">{vendor.default_discount_percent}%</td>
                    <td className="text-right font-semibold text-red-600">
                      {formatCurrency(vendor.outstanding_balance)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="font-bold border-t-2">
                  <td colSpan={4}>Total Payables</td>
                  <td className="text-right text-red-600">{formatCurrency(totalPayables)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
