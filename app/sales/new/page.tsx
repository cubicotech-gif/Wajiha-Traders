'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { formatCurrency, calculateDiscount, generateBillNumber } from '@/lib/utils'
import toast from 'react-hot-toast'
import { ArrowLeft, Plus, Trash2 } from 'lucide-react'
import Link from 'next/link'
import type { Product } from '@/lib/types'
import type { Database } from '@/lib/types'

type Customer = Database['public']['Tables']['customers']['Row']

type LineItem = {
  id: string
  product_id: string
  product_name: string
  quantity: number
  selling_price: number
  discount_percent: number
  total_amount: number
}

export default function NewSalePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [customers, setCustomers] = useState<Customer[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [lineItems, setLineItems] = useState<LineItem[]>([])
  const [formData, setFormData] = useState({
    customer_id: '',
    sale_date: new Date().toISOString().split('T')[0],
    payment_type: 'cash' as 'cash' | 'credit' | 'advance',
    discount_percent: '0',
    paid_amount: '0',
    notes: '',
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    const [customersRes, productsRes] = await Promise.all([
      supabase.from('customers').select('*').order('name'),
      supabase.from('products').select('*').order('name'),
    ])

    if (customersRes.data) setCustomers(customersRes.data)
    if (productsRes.data) setProducts(productsRes.data as Product[])
  }

  const addLineItem = () => {
    setLineItems([
      ...lineItems,
      {
        id: Math.random().toString(),
        product_id: '',
        product_name: '',
        quantity: 1,
        selling_price: 0,
        discount_percent: 0,
        total_amount: 0,
      },
    ])
  }

  const removeLineItem = (id: string) => {
    setLineItems(lineItems.filter((item) => item.id !== id))
  }

  const updateLineItem = (id: string, field: string, value: any) => {
    setLineItems(
      lineItems.map((item) => {
        if (item.id !== id) return item

        const updated = { ...item, [field]: value }

        if (field === 'product_id') {
          const product = products.find((p) => p.id === value)
          if (product) {
            updated.product_name = product.name
            updated.selling_price = product.retail_price
          }
        }

        const itemTotal = updated.quantity * updated.selling_price
        const discount = (itemTotal * updated.discount_percent) / 100
        updated.total_amount = itemTotal - discount

        return updated
      })
    )
  }

  const calculateTotals = () => {
    const total_amount = lineItems.reduce((sum, item) => sum + item.total_amount, 0)
    const discount_amount = calculateDiscount(total_amount, parseFloat(formData.discount_percent))
    const net_amount = total_amount - discount_amount
    const paid_amount = parseFloat(formData.paid_amount) || 0
    const remaining_balance = net_amount - paid_amount

    return { total_amount, discount_amount, net_amount, paid_amount, remaining_balance }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (lineItems.length === 0) {
      toast.error('Please add at least one product')
      return
    }

    setLoading(true)

    try {
      const totals = calculateTotals()
      const bill_number = generateBillNumber()

      // Insert sale
      const { data: saleData, error: saleError } = await supabase
        .from('sales')
        .insert({
          customer_id: formData.customer_id || null,
          sale_date: formData.sale_date,
          bill_number,
          payment_type: formData.payment_type,
          total_amount: totals.total_amount,
          discount_percent: parseFloat(formData.discount_percent),
          discount_amount: totals.discount_amount,
          net_amount: totals.net_amount,
          paid_amount: totals.paid_amount,
          remaining_balance: totals.remaining_balance,
          status: totals.remaining_balance === 0 ? 'paid' : 'pending',
          notes: formData.notes || null,
        })
        .select()
        .single()

      if (saleError) throw saleError

      // Insert sale items
      const saleItems = lineItems.map((item) => ({
        sale_id: saleData.id,
        product_id: item.product_id,
        quantity: item.quantity,
        selling_price: item.selling_price,
        discount_percent: item.discount_percent,
        total_amount: item.total_amount,
      }))

      const { error: itemsError } = await supabase.from('sale_items').insert(saleItems)

      if (itemsError) throw itemsError

      // Update product stock
      for (const item of lineItems) {
        const product = products.find((p) => p.id === item.product_id)
        if (product) {
          await supabase
            .from('products')
            .update({ current_stock: product.current_stock - item.quantity })
            .eq('id', item.product_id)
        }
      }

      // Update customer balance if credit
      if (formData.customer_id && totals.remaining_balance > 0) {
        const customer = customers.find((c) => c.id === formData.customer_id)
        if (customer) {
          await supabase
            .from('customers')
            .update({ outstanding_balance: customer.outstanding_balance + totals.remaining_balance })
            .eq('id', formData.customer_id)
        }
      }

      toast.success('Sale created successfully')
      router.push('/sales')
    } catch (error) {
      console.error('Error creating sale:', error)
      toast.error('Failed to create sale')
    } finally {
      setLoading(false)
    }
  }

  const totals = calculateTotals()

  return (
    <div className="page-container">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link href="/sales" className="text-primary-600 hover:underline flex items-center gap-2 mb-4">
            <ArrowLeft size={20} />
            Back to Sales
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">New Sale</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Sale Details */}
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Sale Details</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Customer</label>
                <select
                  value={formData.customer_id}
                  onChange={(e) => setFormData({ ...formData, customer_id: e.target.value })}
                  className="input"
                >
                  <option value="">Walk-in Customer</option>
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.shop_name || customer.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">Sale Date</label>
                <input
                  type="date"
                  value={formData.sale_date}
                  onChange={(e) => setFormData({ ...formData, sale_date: e.target.value })}
                  className="input"
                />
              </div>

              <div>
                <label className="label">Payment Type</label>
                <select
                  value={formData.payment_type}
                  onChange={(e) => setFormData({ ...formData, payment_type: e.target.value as any })}
                  className="input"
                >
                  <option value="cash">Cash</option>
                  <option value="credit">Credit</option>
                  <option value="advance">Advance</option>
                </select>
              </div>
            </div>
          </div>

          {/* Line Items */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Products</h2>
              <button type="button" onClick={addLineItem} className="btn-primary flex items-center gap-2">
                <Plus size={18} />
                Add Product
              </button>
            </div>

            {lineItems.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No products added yet
              </div>
            ) : (
              <div className="space-y-3">
                {lineItems.map((item) => (
                  <div key={item.id} className="grid grid-cols-12 gap-2 items-start p-3 bg-gray-50 rounded-lg">
                    <div className="col-span-12 md:col-span-4">
                      <select
                        value={item.product_id}
                        onChange={(e) => updateLineItem(item.id, 'product_id', e.target.value)}
                        className="input"
                        required
                      >
                        <option value="">Select Product</option>
                        {products.map((product) => (
                          <option key={product.id} value={product.id}>
                            {product.name} (Stock: {product.current_stock})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-span-4 md:col-span-2">
                      <input
                        type="number"
                        step="0.01"
                        placeholder="Qty"
                        value={item.quantity}
                        onChange={(e) => updateLineItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                        className="input"
                        required
                      />
                    </div>

                    <div className="col-span-4 md:col-span-2">
                      <input
                        type="number"
                        step="0.01"
                        placeholder="Price"
                        value={item.selling_price}
                        onChange={(e) => updateLineItem(item.id, 'selling_price', parseFloat(e.target.value) || 0)}
                        className="input"
                        required
                      />
                    </div>

                    <div className="col-span-3 md:col-span-2">
                      <input
                        type="number"
                        step="0.01"
                        placeholder="Disc %"
                        value={item.discount_percent}
                        onChange={(e) => updateLineItem(item.id, 'discount_percent', parseFloat(e.target.value) || 0)}
                        className="input"
                      />
                    </div>

                    <div className="col-span-9 md:col-span-1 flex items-center font-medium">
                      {formatCurrency(item.total_amount)}
                    </div>

                    <div className="col-span-12 md:col-span-1 flex justify-end">
                      <button
                        type="button"
                        onClick={() => removeLineItem(item.id)}
                        className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={18} className="text-red-600" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Totals */}
          <div className="card">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-semibold">{formatCurrency(totals.total_amount)}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-600">Discount:</span>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="0.01"
                    value={formData.discount_percent}
                    onChange={(e) => setFormData({ ...formData, discount_percent: e.target.value })}
                    className="input w-20 text-right"
                  />
                  <span>%</span>
                  <span className="font-semibold w-24 text-right">{formatCurrency(totals.discount_amount)}</span>
                </div>
              </div>

              <div className="flex justify-between text-lg border-t pt-3">
                <span className="font-semibold">Net Amount:</span>
                <span className="font-bold text-primary-600">{formatCurrency(totals.net_amount)}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-600">Paid Amount:</span>
                <input
                  type="number"
                  step="0.01"
                  value={formData.paid_amount}
                  onChange={(e) => setFormData({ ...formData, paid_amount: e.target.value })}
                  className="input w-40 text-right"
                />
              </div>

              <div className="flex justify-between text-lg">
                <span className="font-semibold">Balance:</span>
                <span className={`font-bold ${totals.remaining_balance > 0 ? 'text-warning-600' : 'text-success-600'}`}>
                  {formatCurrency(totals.remaining_balance)}
                </span>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="card">
            <label className="label">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="input"
              rows={3}
              placeholder="Additional notes..."
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex-1"
            >
              {loading ? 'Creating Sale...' : 'Create Sale'}
            </button>
            <Link href="/sales" className="btn-outline">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
