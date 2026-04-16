'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { formatCurrency, generateBillNumber } from '@/lib/utils'
import toast from 'react-hot-toast'
import { ArrowLeft, Plus, Trash2 } from 'lucide-react'

type Product = { id: string; name: string; retail_price: number; current_stock: number }
type Customer = { id: string; name: string; shop_name: string | null }

type Line = {
  product_id: string
  quantity: number
  selling_price: number
  discount_percent: number
}

export default function NewSalePage() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [saving, setSaving] = useState(false)

  const [customerId, setCustomerId] = useState('')
  const [saleDate, setSaleDate] = useState(new Date().toISOString().split('T')[0])
  const [paymentType, setPaymentType] = useState<'cash' | 'credit' | 'advance'>('cash')
  const [paidAmount, setPaidAmount] = useState('0')
  const [discountPercent, setDiscountPercent] = useState('0')
  const [notes, setNotes] = useState('')
  const [lines, setLines] = useState<Line[]>([])

  useEffect(() => {
    const load = async () => {
      const [{ data: prods }, { data: custs }] = await Promise.all([
        supabase.from('products').select('id, name, retail_price, current_stock').order('name'),
        supabase.from('customers').select('id, name, shop_name').order('name'),
      ])
      setProducts(prods || [])
      setCustomers(custs || [])
    }
    load()
  }, [])

  const addLine = () => {
    setLines([...lines, { product_id: '', quantity: 1, selling_price: 0, discount_percent: 0 }])
  }

  const updateLine = (idx: number, patch: Partial<Line>) => {
    setLines(lines.map((l, i) => (i === idx ? { ...l, ...patch } : l)))
  }

  const removeLine = (idx: number) => {
    setLines(lines.filter((_, i) => i !== idx))
  }

  const onProductChange = (idx: number, productId: string) => {
    const p = products.find((x) => x.id === productId)
    updateLine(idx, { product_id: productId, selling_price: p?.retail_price || 0 })
  }

  const subtotal = lines.reduce((sum, l) => {
    const lineTotal = l.quantity * l.selling_price
    return sum + lineTotal - (lineTotal * l.discount_percent) / 100
  }, 0)

  const discountPct = Number(discountPercent) || 0
  const discountAmt = (subtotal * discountPct) / 100
  const netAmount = subtotal - discountAmt
  const paid = Number(paidAmount) || 0
  const remaining = netAmount - paid

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (lines.length === 0) return toast.error('Add at least one item')
    if (lines.some((l) => !l.product_id)) return toast.error('Select product for all lines')

    setSaving(true)

    const { data: sale, error: saleErr } = await supabase
      .from('sales')
      .insert({
        customer_id: customerId || null,
        sale_date: saleDate,
        total_amount: subtotal,
        discount_percent: discountPct,
        discount_amount: discountAmt,
        net_amount: netAmount,
        payment_type: paymentType,
        paid_amount: paid,
        remaining_balance: remaining,
        status: remaining <= 0 ? 'paid' : 'pending',
        bill_number: generateBillNumber(),
        notes: notes || null,
      })
      .select()
      .single()

    if (saleErr || !sale) {
      setSaving(false)
      return toast.error(saleErr?.message || 'Failed to save sale')
    }

    const itemsPayload = lines.map((l) => ({
      sale_id: sale.id,
      product_id: l.product_id,
      quantity: l.quantity,
      selling_price: l.selling_price,
      discount_percent: l.discount_percent,
      total_amount:
        l.quantity * l.selling_price -
        (l.quantity * l.selling_price * l.discount_percent) / 100,
    }))

    const { error: itemsErr } = await supabase.from('sale_items').insert(itemsPayload)
    if (itemsErr) {
      setSaving(false)
      return toast.error('Saved sale but items failed: ' + itemsErr.message)
    }

    // Update stock
    for (const l of lines) {
      const p = products.find((x) => x.id === l.product_id)
      if (p) {
        await supabase
          .from('products')
          .update({ current_stock: Math.max(0, p.current_stock - l.quantity) })
          .eq('id', l.product_id)
      }
    }

    // Update customer outstanding
    if (customerId && remaining > 0) {
      const cust = customers.find((c) => c.id === customerId) as any
      if (cust) {
        const { data: current } = await supabase
          .from('customers')
          .select('outstanding_balance')
          .eq('id', customerId)
          .single()
        await supabase
          .from('customers')
          .update({ outstanding_balance: (current?.outstanding_balance || 0) + remaining })
          .eq('id', customerId)
      }
    }

    setSaving(false)
    toast.success('Sale recorded')
    router.push('/sales')
  }

  return (
    <div className="page-container max-w-4xl">
      <Link href="/sales" className="flex items-center gap-2 text-sm text-gray-600 mb-4 hover:text-gray-900">
        <ArrowLeft size={16} /> Back
      </Link>
      <h1 className="text-2xl font-bold mb-6">New Sale</h1>

      <form onSubmit={submit} className="space-y-4">
        <div className="card space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label">Customer</label>
              <select className="input" value={customerId} onChange={(e) => setCustomerId(e.target.value)}>
                <option value="">Walk-in Customer</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.shop_name || c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Sale Date</label>
              <input type="date" className="input" value={saleDate} onChange={(e) => setSaleDate(e.target.value)} />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Items</h2>
            <button type="button" onClick={addLine} className="btn-secondary btn-sm flex items-center gap-1">
              <Plus size={14} /> Add Item
            </button>
          </div>

          {lines.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-6">No items added</p>
          ) : (
            <div className="space-y-3">
              {lines.map((l, idx) => {
                const p = products.find((x) => x.id === l.product_id)
                const lineTotal =
                  l.quantity * l.selling_price -
                  (l.quantity * l.selling_price * l.discount_percent) / 100
                return (
                  <div key={idx} className="border border-gray-200 rounded-lg p-3 space-y-2">
                    <div className="flex gap-2">
                      <select
                        className="input flex-1"
                        value={l.product_id}
                        onChange={(e) => onProductChange(idx, e.target.value)}
                      >
                        <option value="">-- Select Product --</option>
                        {products.map((pp) => (
                          <option key={pp.id} value={pp.id}>
                            {pp.name} (Stock: {pp.current_stock})
                          </option>
                        ))}
                      </select>
                      <button type="button" onClick={() => removeLine(idx)} className="text-danger-600 p-2">
                        <Trash2 size={18} />
                      </button>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="text-xs text-gray-600">Qty</label>
                        <input
                          type="number"
                          step="0.01"
                          className="input"
                          value={l.quantity}
                          onChange={(e) => updateLine(idx, { quantity: Number(e.target.value) })}
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-600">Price</label>
                        <input
                          type="number"
                          step="0.01"
                          className="input"
                          value={l.selling_price}
                          onChange={(e) => updateLine(idx, { selling_price: Number(e.target.value) })}
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-600">Disc %</label>
                        <input
                          type="number"
                          step="0.01"
                          className="input"
                          value={l.discount_percent}
                          onChange={(e) => updateLine(idx, { discount_percent: Number(e.target.value) })}
                        />
                      </div>
                    </div>
                    <div className="text-sm text-right text-gray-600">
                      Line Total: <span className="font-semibold text-gray-900">{formatCurrency(lineTotal)}</span>
                      {p && l.quantity > p.current_stock && (
                        <span className="text-danger-600 ml-2">⚠ Exceeds stock</span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div className="card space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label">Overall Discount %</label>
              <input type="number" step="0.01" className="input" value={discountPercent} onChange={(e) => setDiscountPercent(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Payment Type</label>
              <select className="input" value={paymentType} onChange={(e) => setPaymentType(e.target.value as any)}>
                <option value="cash">Cash</option>
                <option value="credit">Credit</option>
                <option value="advance">Advance</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Paid Amount</label>
            <input type="number" step="0.01" className="input" value={paidAmount} onChange={(e) => setPaidAmount(e.target.value)} />
          </div>

          <div className="form-group">
            <label className="form-label">Notes</label>
            <textarea className="input" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>

          <div className="border-t border-gray-200 pt-4 space-y-1 text-sm">
            <div className="flex justify-between"><span>Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
            <div className="flex justify-between"><span>Discount</span><span>- {formatCurrency(discountAmt)}</span></div>
            <div className="flex justify-between font-bold text-base pt-1"><span>Net Total</span><span>{formatCurrency(netAmount)}</span></div>
            <div className="flex justify-between text-gray-600"><span>Paid</span><span>{formatCurrency(paid)}</span></div>
            <div className="flex justify-between font-semibold text-danger-600"><span>Remaining</span><span>{formatCurrency(remaining)}</span></div>
          </div>
        </div>

        <div className="flex gap-3">
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? 'Saving...' : 'Save Sale'}
          </button>
          <Link href="/sales" className="btn-secondary">Cancel</Link>
        </div>
      </form>
    </div>
  )
}
