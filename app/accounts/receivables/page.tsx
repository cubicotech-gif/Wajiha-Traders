'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { formatCurrency, formatPhone } from '@/lib/utils'
import { DollarSign, Search } from 'lucide-react'
import toast from 'react-hot-toast'
import type { Database } from '@/lib/types'

type Customer = Database['public']['Tables']['customers']['Row']

export default function ReceivablesPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    loadReceivables()
  }, [])

  const loadReceivables = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .gt('outstanding_balance', 0)
        .order('outstanding_balance', { ascending: false })

      if (error) throw error
      setCustomers(data || [])
    } catch (error) {
      console.error('Error loading receivables:', error)
      toast.error('Failed to load receivables')
    } finally {
      setLoading(false)
    }
  }

  const filteredCustomers = customers.filter((customer) =>
    customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.shop_name?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const totalReceivables = customers.reduce((sum, c) => sum + c.outstanding_balance, 0)

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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Accounts Receivable</h1>
        <p className="text-gray-600">Outstanding balances from customers</p>
      </div>

      {/* Total */}
      <div className="card mb-6 bg-gradient-primary text-white">
        <div className="flex items-center gap-3 mb-2">
          <DollarSign size={24} />
          <span className="text-lg">Total Receivables</span>
        </div>
        <div className="text-4xl font-bold">{formatCurrency(totalReceivables)}</div>
        <div className="text-sm opacity-90 mt-1">{filteredCustomers.length} customers with outstanding balance</div>
      </div>

      {/* Search */}
      <div className="card mb-6">
        <div className="relative">
          <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search customers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input pl-10 w-full"
          />
        </div>
      </div>

      {/* Receivables List */}
      {filteredCustomers.length === 0 ? (
        <div className="empty-state">
          <DollarSign size={48} className="text-gray-300 mb-4" />
          <p className="text-gray-500">
            {searchQuery ? 'No customers found' : 'No outstanding receivables'}
          </p>
        </div>
      ) : (
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Customer Balances</h2>
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Customer Name</th>
                  <th>Shop Name</th>
                  <th>Phone</th>
                  <th className="text-right">Credit Limit</th>
                  <th className="text-right">Outstanding</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map((customer) => (
                  <tr key={customer.id}>
                    <td className="font-medium">{customer.name}</td>
                    <td>{customer.shop_name || '-'}</td>
                    <td>{customer.phone ? formatPhone(customer.phone) : '-'}</td>
                    <td className="text-right">{formatCurrency(customer.credit_limit)}</td>
                    <td className="text-right font-semibold text-warning-600">
                      {formatCurrency(customer.outstanding_balance)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="font-bold border-t-2">
                  <td colSpan={4}>Total Receivables</td>
                  <td className="text-right text-warning-600">{formatCurrency(totalReceivables)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
