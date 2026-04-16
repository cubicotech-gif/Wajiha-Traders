'use client'

import { useState } from 'react'
import { useStored, uid, formatPKR } from '@/lib/storage'
import type { Product } from '@/lib/types'
import { Plus, Trash2, Pencil, X, Search } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ProductsPage() {
  const [products, setProducts] = useStored<Product[]>('products', [])
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Product | null>(null)
  const [search, setSearch] = useState('')
  const [form, setForm] = useState({ name: '', company: '', price: '', stock: '' })

  const openAdd = () => {
    setEditing(null)
    setForm({ name: '', company: '', price: '', stock: '' })
    setOpen(true)
  }

  const openEdit = (p: Product) => {
    setEditing(p)
    setForm({
      name: p.name,
      company: p.company,
      price: p.price.toString(),
      stock: p.stock.toString(),
    })
    setOpen(true)
  }

  const save = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) return toast.error('Name required')
    const price = Number(form.price) || 0
    const stock = Number(form.stock) || 0

    if (editing) {
      setProducts((prev) =>
        prev.map((p) =>
          p.id === editing.id
            ? { ...p, name: form.name.trim(), company: form.company.trim(), price, stock }
            : p
        )
      )
      toast.success('Updated')
    } else {
      setProducts((prev) => [
        ...prev,
        { id: uid(), name: form.name.trim(), company: form.company.trim(), price, stock },
      ])
      toast.success('Added')
    }
    setOpen(false)
  }

  const remove = (id: string) => {
    if (!confirm('Delete this product?')) return
    setProducts((prev) => prev.filter((p) => p.id !== id))
    toast.success('Deleted')
  }

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.company.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="page">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Products</h1>
        <button onClick={openAdd} className="btn-primary flex items-center gap-1.5">
          <Plus size={16} /> Add Product
        </button>
      </div>

      <div className="card mb-4">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
          <input
            className="input pl-9"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="card">
        {filtered.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-8">No products yet</p>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Company</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id}>
                    <td className="font-medium">{p.name}</td>
                    <td>{p.company || '-'}</td>
                    <td>{formatPKR(p.price)}</td>
                    <td className={p.stock <= 10 ? 'text-red-600 font-medium' : ''}>
                      {p.stock}
                    </td>
                    <td>
                      <div className="flex gap-2 justify-end">
                        <button onClick={() => openEdit(p)} className="text-gray-500 hover:text-blue-600">
                          <Pencil size={15} />
                        </button>
                        <button onClick={() => remove(p.id)} className="text-gray-500 hover:text-red-600">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {open && (
        <Modal title={editing ? 'Edit Product' : 'Add Product'} onClose={() => setOpen(false)}>
          <form onSubmit={save} className="space-y-3">
            <div>
              <label className="label">Name *</label>
              <input
                className="input"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                autoFocus
              />
            </div>
            <div>
              <label className="label">Company</label>
              <input
                className="input"
                value={form.company}
                onChange={(e) => setForm({ ...form, company: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Price (Rs.)</label>
                <input
                  type="number"
                  className="input"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                />
              </div>
              <div>
                <label className="label">Stock</label>
                <input
                  type="number"
                  className="input"
                  value={form.stock}
                  onChange={(e) => setForm({ ...form, stock: e.target.value })}
                />
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button type="submit" className="btn-primary flex-1">
                {editing ? 'Update' : 'Add'}
              </button>
              <button type="button" onClick={() => setOpen(false)} className="btn-secondary">
                Cancel
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-lg w-full max-w-md p-5" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-lg">{title}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-900">
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
