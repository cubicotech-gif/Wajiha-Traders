export type Product = {
  id: string
  name: string
  company: string
  price: number
  stock: number
}

export type Customer = {
  id: string
  name: string
  shop: string
  phone: string
}

export type SaleItem = {
  productId: string
  productName: string
  quantity: number
  price: number
}

export type Sale = {
  id: string
  billNumber: string
  date: string
  customerId: string | null
  customerName: string
  items: SaleItem[]
  total: number
  paid: number
  status: 'paid' | 'pending'
}
