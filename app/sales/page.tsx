'use client'

import { useState } from 'react'
import { useStored, uid, formatPKR, today, billNumber } from '@/lib/storage'
import type { Product, Customer, Sale, SaleItem } from '@/lib/types'
import { Plus, Trash2, X } from 'lucide-react'
import toast from 'react-hot-toast'

export default function SalesPage() {
  const [sales, setSales] = useStored<Sale[]>('sales', [])
  const [products, setProducts] = useStored<Product[]>('products', [])
  const [customers] = useStored<Customer[]>('customers', [])

  const [open, setOpen] = useState(false)

  const deleteSale = (id: string) => {
    if (!confirm('Delete this sale? (Stock will NOT be restored)')) return
    setSales((prev) => prev.filter((s) => s.id !== id))
    toast.success('Deleted')
  }

  const sorted = [...sales].sort((a, b) => b.id.localeCompare(a.id))

  return (
    <div className="page">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Sales</h1>
        <button onClick={() => setOpen(true)} className="btn-primary flex items-center gap-1.5">
          <Plus size={16} /> New Sale
        </button>
      </div>

      <div className="card">
        {sorted.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-8">No sales yet</p>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Bill #</th>
                  <th>Date</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Paid</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((s) => (
                  <tr key={s.id}>
                    <td className="font-medium">{s.billNumber}</td>
                    <td>{s.date}</td>
                    <td>{s.customerName}</td>
                    <td>{s.items.length}</td>
                    <td className="font-semibold">{formatPKR(s.total)}</td>
                    <td>{formatPKR(s.paid)}</td>
                    <td>
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                          s.status === 'paid'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {s.status}
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => deleteSale(s.id)}
                        className="text-gray-500 hover:text-red-600"
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {open && (
        <NewSaleModal
          products={products}
          customers={customers}
          onClose={() => setOpen(false)}
          onSave={(sale, stockUpdates) => {
            setSales((prev) => [...prev, sale])
            setProducts((prev) =>
              prev.map((p) =>
                stockUpdates[p.id] !== undefined
                  ? { ...p, stock: Math.max(0, p.stock - stockUpdates[p.id]) }
                  : p
              )
            )
            toast.success('Sale saved')
            setOpen(false)
          }}
        />
      )}
    </div>
  )
}

function NewSaleModal({
  products,
  customers,
  onClose,
  onSave,
}: {
  products: Product[]
  customers: Customer[]
  onClose: () => void
  onSave: (sale: Sale, stockUpdates: Record<string, number>) => void
}) {
  const [customerId, setCustomerId] = useState('')
  const [date, setDate] = useState(today())
  const [paid, setPaid] = useState('0')
  const [lines, setLines] = useState<
    { productId: string; quantity: string; price: string }[]
  >([])

  const addLine = () =>
    setLines((prev) => [...prev, { productId: '', quantity: '1', price: '0' }])

  const updateLine = (idx: number, patch: Partial<{ productId: string; quantity: string; price: string }>) =>
    setLines((prev) => prev.map((l, i) => (i === idx ? { ...l, ...patch } : l)))

  const removeLine = (idx: number) => setLines((prev) => prev.filter((_, i) => i !== idx))

  const onProductChange = (idx: number, productId: string) => {
    const p = products.find((x) => x.id === productId)
    updateLine(idx, { productId, price: p ? p.price.toString() : '0' })
  }

  const total = lines.reduce(
    (sum, l) => sum + (Number(l.quantity) || 0) * (Number(l.price) || 0),
    0
  )
  const paidNum = Number(paid) || 0

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (lines.length === 0) return toast.error('Add at least one item')
    if (lines.some((l) => !l.productId)) return toast.error('Select product for all items')

    const customer = customers.find((c) => c.id === customerId)
    const items: SaleItem[] = lines.map((l) => {
      const p = products.find((x) => x.id === l.productId)!
      return {
        productId: l.productId,
        productName: p.name,
        quantity: Number(l.quantity) || 0,
        price: Number(l.price) || 0,
      }
    })

    const stockUpdates: Record<string, number> = {}
    for (const it of items) {
      stockUpdates[it.productId] = (stockUpdates[it.productId] || 0) + it.quantity
    }

    const sale: Sale = {
      id: uid(),
      billNumber: billNumber(),
      date,
      customerId: customerId || null,
      customerName: customer ? customer.shop || customer.name : 'Walk-in',
      items,
      total,
      paid: paidNum,
      status: paidNum >= total ? 'paid' : 'pending',
    }

    onSave(sale, stockUpdates)
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-lg w-full max-w-2xl p-5 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-lg">New Sale</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-900">
            <X size={18} />
          </button>
        </div>

        {products.length === 0 ? (
          <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded p-3">
            Add some products first before creating a sale.
          </p>
        ) : (
          <form onSubmit={submit} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Customer</label>
                <select
                  className="input"
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value)}
                >
                  <option value="">Walk-in</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.shop || c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Date</label>
                <input
                  type="date"
                  className="input"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="label mb-0">Items</label>
                <button type="button" onClick={addLine} className="text-sm text-blue-600 hover:underline flex items-center gap-1">
                  <Plus size={14} /> Add Item
                </button>
              </div>

              {lines.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4 border border-dashed rounded">
                  No items added
                </p>
              ) : (
                <div className="space-y-2">
                  {lines.map((l, idx) => {
                    const p = products.find((x) => x.id === l.productId)
                    const overStock = p && Number(l.quantity) > p.stock
                    return (
                      <div key={idx} className="border border-gray-200 rounded p-2 space-y-2">
                        <div className="flex gap-2">
                          <select
                            className="input flex-1"
                            value={l.productId}
                            onChange={(e) => onProductChange(idx, e.target.value)}
                          >
                            <option value="">-- Select Product --</option>
                            {products.map((pp) => (
                              <option key={pp.id} value={pp.id}>
                                {pp.name} (Stock: {pp.stock})
                              </option>
                            ))}
                          </select>
                          <button
                            type="button"
                            onClick={() => removeLine(idx)}
                            className="text-red-600 px-2"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <label className="text-xs text-gray-600">Qty</label>
                            <input
                              type="number"
                              className="input"
                              value={l.quantity}
                              onChange={(e) => updateLine(idx, { quantity: e.target.value })}
                            />
                          </div>
                          <div>
                            <label className="text-xs text-gray-600">Price</label>
                            <input
                              type="number"
                              className="input"
                              value={l.price}
                              onChange={(e) => updateLine(idx, { price: e.target.value })}
                            />
                          </div>
                          <div>
                            <label className="text-xs text-gray-600">Line Total</label>
                            <div className="px-3 py-2 text-sm font-semibold">
                              {formatPKR((Number(l.quantity) || 0) * (Number(l.price) || 0))}
                            </div>
                          </div>
                        </div>
                        {overStock && (
                          <p className="text-xs text-red-600">⚠ Exceeds available stock</p>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            <div>
              <label className="label">Paid Amount</label>
              <input
                type="number"
                className="input"
                value={paid}
                onChange={(e) => setPaid(e.target.value)}
              />
            </div>

            <div className="border-t pt-3 space-y-1 text-sm">
              <div className="flex justify-between font-bold text-base">
                <span>Total</span>
                <span>{formatPKR(total)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Paid</span>
                <span>{formatPKR(paidNum)}</span>
              </div>
              <div className="flex justify-between font-semibold text-red-600">
                <span>Remaining</span>
                <span>{formatPKR(Math.max(0, total - paidNum))}</span>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button type="submit" className="btn-primary flex-1">Save Sale</button>
              <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
