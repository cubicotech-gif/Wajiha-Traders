'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home,
  Package,
  FileText,
  ShoppingCart,
  DollarSign,
} from 'lucide-react'

export default function BottomNav() {
  const pathname = usePathname()

  const navigation = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Inventory', href: '/inventory', icon: Package },
    { name: 'Sales', href: '/sales', icon: FileText },
    { name: 'Purchase', href: '/purchases', icon: ShoppingCart },
    { name: 'Accounts', href: '/accounts/dsr', icon: DollarSign },
  ]

  const isActive = (href: string) => {
    if (href === '/') return pathname === href
    return pathname.startsWith(href)
  }

  return (
    <div className="md:hidden bottom-nav safe-bottom no-print">
      <div className="grid grid-cols-5 gap-1 px-2">
        {navigation.map((item) => {
          const Icon = item.icon
          const active = isActive(item.href)
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`bottom-nav-item ${active ? 'active' : 'text-gray-600'}`}
            >
              <Icon size={20} className={active ? 'text-primary-600' : ''} />
              <span className="mt-1">{item.name}</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
