export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      companies: {
        Row: {
          id: string
          name: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          created_at?: string
        }
      }
      products: {
        Row: {
          id: string
          name: string
          company_id: string | null
          unit_type: 'gm' | 'ml' | 'pieces' | 'cartons' | 'kg' | 'liter'
          unit_value: number | null
          retail_price: number
          current_stock: number
          min_stock_level: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          company_id?: string | null
          unit_type: 'gm' | 'ml' | 'pieces' | 'cartons' | 'kg' | 'liter'
          unit_value?: number | null
          retail_price: number
          current_stock?: number
          min_stock_level?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          company_id?: string | null
          unit_type?: 'gm' | 'ml' | 'pieces' | 'cartons' | 'kg' | 'liter'
          unit_value?: number | null
          retail_price?: number
          current_stock?: number
          min_stock_level?: number
          created_at?: string
          updated_at?: string
        }
      }
      vendors: {
        Row: {
          id: string
          name: string
          phone: string | null
          address: string | null
          default_discount_percent: number
          outstanding_balance: number
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          phone?: string | null
          address?: string | null
          default_discount_percent?: number
          outstanding_balance?: number
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          phone?: string | null
          address?: string | null
          default_discount_percent?: number
          outstanding_balance?: number
          created_at?: string
        }
      }
      customers: {
        Row: {
          id: string
          name: string
          shop_name: string | null
          phone: string | null
          address: string | null
          credit_limit: number
          outstanding_balance: number
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          shop_name?: string | null
          phone?: string | null
          address?: string | null
          credit_limit?: number
          outstanding_balance?: number
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          shop_name?: string | null
          phone?: string | null
          address?: string | null
          credit_limit?: number
          outstanding_balance?: number
          created_at?: string
        }
      }
      purchases: {
        Row: {
          id: string
          vendor_id: string | null
          purchase_date: string
          total_amount: number
          discount_percent: number
          discount_amount: number
          net_amount: number
          payment_type: 'cash' | 'credit' | 'advance'
          paid_amount: number
          remaining_balance: number
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          vendor_id?: string | null
          purchase_date?: string
          total_amount?: number
          discount_percent?: number
          discount_amount?: number
          net_amount?: number
          payment_type: 'cash' | 'credit' | 'advance'
          paid_amount?: number
          remaining_balance?: number
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          vendor_id?: string | null
          purchase_date?: string
          total_amount?: number
          discount_percent?: number
          discount_amount?: number
          net_amount?: number
          payment_type?: 'cash' | 'credit' | 'advance'
          paid_amount?: number
          remaining_balance?: number
          notes?: string | null
          created_at?: string
        }
      }
      purchase_items: {
        Row: {
          id: string
          purchase_id: string
          product_id: string | null
          quantity: number
          retail_price: number
          discount_percent: number
          purchase_price: number
          total_amount: number
          created_at: string
        }
        Insert: {
          id?: string
          purchase_id: string
          product_id?: string | null
          quantity: number
          retail_price: number
          discount_percent?: number
          purchase_price: number
          total_amount: number
          created_at?: string
        }
        Update: {
          id?: string
          purchase_id?: string
          product_id?: string | null
          quantity?: number
          retail_price?: number
          discount_percent?: number
          purchase_price?: number
          total_amount?: number
          created_at?: string
        }
      }
      sales: {
        Row: {
          id: string
          customer_id: string | null
          sale_date: string
          delivery_date: string | null
          is_advance_booking: boolean
          total_amount: number
          discount_percent: number
          discount_amount: number
          net_amount: number
          payment_type: 'cash' | 'credit' | 'advance'
          paid_amount: number
          remaining_balance: number
          status: 'pending' | 'delivered' | 'paid' | 'cancelled'
          bill_number: string | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          customer_id?: string | null
          sale_date?: string
          delivery_date?: string | null
          is_advance_booking?: boolean
          total_amount?: number
          discount_percent?: number
          discount_amount?: number
          net_amount?: number
          payment_type: 'cash' | 'credit' | 'advance'
          paid_amount?: number
          remaining_balance?: number
          status?: 'pending' | 'delivered' | 'paid' | 'cancelled'
          bill_number?: string | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          customer_id?: string | null
          sale_date?: string
          delivery_date?: string | null
          is_advance_booking?: boolean
          total_amount?: number
          discount_percent?: number
          discount_amount?: number
          net_amount?: number
          payment_type?: 'cash' | 'credit' | 'advance'
          paid_amount?: number
          remaining_balance?: number
          status?: 'pending' | 'delivered' | 'paid' | 'cancelled'
          bill_number?: string | null
          notes?: string | null
          created_at?: string
        }
      }
      sale_items: {
        Row: {
          id: string
          sale_id: string
          product_id: string | null
          quantity: number
          selling_price: number
          discount_percent: number
          total_amount: number
          created_at: string
        }
        Insert: {
          id?: string
          sale_id: string
          product_id?: string | null
          quantity: number
          selling_price: number
          discount_percent?: number
          total_amount: number
          created_at?: string
        }
        Update: {
          id?: string
          sale_id?: string
          product_id?: string | null
          quantity?: number
          selling_price?: number
          discount_percent?: number
          total_amount?: number
          created_at?: string
        }
      }
      customer_payments: {
        Row: {
          id: string
          customer_id: string
          sale_id: string | null
          payment_date: string
          amount: number
          payment_method: 'cash' | 'bank_transfer' | 'cheque'
          reference_number: string | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          customer_id: string
          sale_id?: string | null
          payment_date?: string
          amount: number
          payment_method: 'cash' | 'bank_transfer' | 'cheque'
          reference_number?: string | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          customer_id?: string
          sale_id?: string | null
          payment_date?: string
          amount?: number
          payment_method?: 'cash' | 'bank_transfer' | 'cheque'
          reference_number?: string | null
          notes?: string | null
          created_at?: string
        }
      }
      vendor_payments: {
        Row: {
          id: string
          vendor_id: string
          purchase_id: string | null
          payment_date: string
          amount: number
          payment_method: 'cash' | 'bank_transfer' | 'cheque'
          reference_number: string | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          vendor_id: string
          purchase_id?: string | null
          payment_date?: string
          amount: number
          payment_method: 'cash' | 'bank_transfer' | 'cheque'
          reference_number?: string | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          vendor_id?: string
          purchase_id?: string | null
          payment_date?: string
          amount?: number
          payment_method?: 'cash' | 'bank_transfer' | 'cheque'
          reference_number?: string | null
          notes?: string | null
          created_at?: string
        }
      }
    }
  }
}

// Extended types with relations
export type Product = Database['public']['Tables']['products']['Row'] & {
  companies?: Database['public']['Tables']['companies']['Row']
}

export type Sale = Database['public']['Tables']['sales']['Row'] & {
  customers?: Database['public']['Tables']['customers']['Row']
  sale_items?: SaleItem[]
}

export type SaleItem = Database['public']['Tables']['sale_items']['Row'] & {
  products?: Product
}

export type Purchase = Database['public']['Tables']['purchases']['Row'] & {
  vendors?: Database['public']['Tables']['vendors']['Row']
  purchase_items?: PurchaseItem[]
}

export type PurchaseItem = Database['public']['Tables']['purchase_items']['Row'] & {
  products?: Product
}
