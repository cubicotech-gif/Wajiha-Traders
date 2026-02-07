'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { formatCurrency, formatPhone } from '@/lib/utils'
import Link from 'next/link'
import { Users, Plus, Search, Phone, MapPin, CreditCard } from 'lucide-react'
import toast from 'react-hot-toast'
import type { Database } from '@/lib/types'

type Customer = Database['public']['Tables']['customers']['Row']

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    loadCustomers()
  }, [])

  const loadCustomers = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('name')

      if (error) throw error
      setCustomers(data || [])
    } catch (error) {
      console.error('Error loading customers:', error)
      toast.error('Failed to load customers')
    } finally {
      setLoading(false)
    }
  }

  const filteredCustomers = customers.filter((customer) =>
    customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.shop_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.phone?.includes(searchQuery)
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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Customers</h1>
          <p className="text-gray-600">Manage your customer database</p>
        </div>
        <Link href="/customers/new" className="btn-primary flex items-center gap-2">
          <Plus size={20} />
          <span className="hidden sm:inline">Add Customer</span>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="card">
          <div className="text-2xl font-bold text-gray-900">{customers.length}</div>
          <div className="text-sm text-gray-600">Total Customers</div>
        </div>
        <div className="card">
          <div className="text-2xl font-bold text-warning-600">{formatCurrency(totalReceivables)}</div>
          <div className="text-sm text-gray-600">Total Receivables</div>
        </div>
      </div>

      {/* Search */}
      <div className="card mb-6">
        <div className="relative">
          <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, shop, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input pl-10 w-full"
          />
        </div>
      </div>

      {/* Customers List */}
      {filteredCustomers.length === 0 ? (
        <div className="empty-state">
          <Users size={48} className="text-gray-300 mb-4" />
          <p className="text-gray-500">
            {searchQuery ? 'No customers found' : 'No customers yet'}
          </p>
          {!searchQuery && (
            <Link href="/customers/new" className="btn-primary mt-4">
              Add Your First Customer
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredCustomers.map((customer) => (
            <div key={customer.id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">{customer.name}</h3>

                  {customer.shop_name && (
                    <p className="text-sm text-gray-600 mb-2">{customer.shop_name}</p>
                  )}

                  <div className="space-y-2 mt-3">
                    {customer.phone && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone size={14} />
                        <span>{formatPhone(customer.phone)}</span>
                      </div>
                    )}

                    {customer.address && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin size={14} />
                        <span>{customer.address}</span>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4 mt-3 pt-3 border-t">
                      <div>
                        <div className="text-xs text-gray-500">Credit Limit</div>
                        <div className="font-medium text-primary-600">{formatCurrency(customer.credit_limit)}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Outstanding</div>
                        <div className={`font-medium ${customer.outstanding_balance > 0 ? 'text-warning-600' : 'text-success-600'}`}>
                          {formatCurrency(customer.outstanding_balance)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <Link
                  href={`/customers/edit/${customer.id}`}
                  className="btn-outline px-3 py-2 text-sm"
                >
                  Edit
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
