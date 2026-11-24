import { create } from 'zustand'

export interface CartItem {
  key: string // productId + size + fit
  productId: string
  name: string
  price: number // PKR
  size: string
  fit: 'standard' | 'made-to-measure'
  colour: string
  image?: string
  qty: number
}

interface CartState {
  items: CartItem[]
  open: boolean
  add: (item: Omit<CartItem, 'key' | 'qty'>, qty?: number) => void
  remove: (key: string) => void
  setQty: (key: string, qty: number) => void
  clear: () => void
  setOpen: (open: boolean) => void
}

export const useCart = create<CartState>((set) => ({
  items: [],
  open: false,
  add: (item, qty = 1) =>
    set((s) => {
      const key = `${item.productId}-${item.size}-${item.fit}-${item.colour}`
      const existing = s.items.find((i) => i.key === key)
      if (existing) {
        return { items: s.items.map((i) => (i.key === key ? { ...i, qty: i.qty + qty } : i)), open: true }
      }
      return { items: [...s.items, { ...item, key, qty }], open: true }
    }),
  remove: (key) => set((s) => ({ items: s.items.filter((i) => i.key !== key) })),
  setQty: (key, qty) =>
    set((s) => ({ items: s.items.map((i) => (i.key === key ? { ...i, qty: Math.max(1, qty) } : i)) })),
  clear: () => set({ items: [] }),
  setOpen: (open) => set({ open }),
}))

export const cartCount = (items: CartItem[]) => items.reduce((n, i) => n + i.qty, 0)
export const cartTotal = (items: CartItem[]) => items.reduce((n, i) => n + i.qty * i.price, 0)
export const formatPKR = (n: number) => `PKR ${n.toLocaleString('en-PK')}`
