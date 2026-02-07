'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { formatCurrency, formatPhone } from '@/lib/utils'
import Link from 'next/link'
import { ShoppingCart, Plus, Search, Phone, MapPin } from 'lucide-react'
import toast from 'react-hot-toast'
import type { Database } from '@/lib/types'

type Vendor = Database['public']['Tables']['vendors']['Row']

export default function VendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    loadVendors()
  }, [])

  const loadVendors = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('vendors')
        .select('*')
        .order('name')

      if (error) throw error
      setVendors(data || [])
    } catch (error) {
      console.error('Error loading vendors:', error)
      toast.error('Failed to load vendors')
    } finally {
      setLoading(false)
    }
  }

  const filteredVendors = vendors.filter((vendor) =>
    vendor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    vendor.phone?.includes(searchQuery)
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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Vendors</h1>
          <p className="text-gray-600">Manage your supplier database</p>
        </div>
        <Link href="/vendors/new" className="btn-primary flex items-center gap-2">
          <Plus size={20} />
          <span className="hidden sm:inline">Add Vendor</span>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="card">
          <div className="text-2xl font-bold text-gray-900">{vendors.length}</div>
          <div className="text-sm text-gray-600">Total Vendors</div>
        </div>
        <div className="card">
          <div className="text-2xl font-bold text-warning-600">{formatCurrency(totalPayables)}</div>
          <div className="text-sm text-gray-600">Total Payables</div>
        </div>
      </div>

      {/* Search */}
      <div className="card mb-6">
        <div className="relative">
          <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input pl-10 w-full"
          />
        </div>
      </div>

      {/* Vendors List */}
      {filteredVendors.length === 0 ? (
        <div className="empty-state">
          <ShoppingCart size={48} className="text-gray-300 mb-4" />
          <p className="text-gray-500">
            {searchQuery ? 'No vendors found' : 'No vendors yet'}
          </p>
          {!searchQuery && (
            <Link href="/vendors/new" className="btn-primary mt-4">
              Add Your First Vendor
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredVendors.map((vendor) => (
            <div key={vendor.id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-3">{vendor.name}</h3>

                  <div className="space-y-2">
                    {vendor.phone && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone size={14} />
                        <span>{formatPhone(vendor.phone)}</span>
                      </div>
                    )}

                    {vendor.address && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin size={14} />
                        <span>{vendor.address}</span>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4 mt-3 pt-3 border-t">
                      <div>
                        <div className="text-xs text-gray-500">Default Discount</div>
                        <div className="font-medium text-primary-600">{vendor.default_discount_percent}%</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Outstanding</div>
                        <div className={`font-medium ${vendor.outstanding_balance > 0 ? 'text-warning-600' : 'text-success-600'}`}>
                          {formatCurrency(vendor.outstanding_balance)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <Link
                  href={`/vendors/edit/${vendor.id}`}
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
