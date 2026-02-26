import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './AuthContext'

interface CartContextType {
  cartCount: number
  refreshCart: () => Promise<void>
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartCount, setCartCount] = useState(0)
  const { user } = useAuth()

  const refreshCart = useCallback(async () => {
    if (!user) {
      setCartCount(0)
      return
    }
    const { data } = await supabase
      .from('carts')
      .select('quantity')
      .eq('user_id', user.id)
    const total = data ? data.reduce((sum: number, item: { quantity: number }) => sum + item.quantity, 0) : 0
    setCartCount(total)
  }, [user])

  useEffect(() => {
    refreshCart()
  }, [refreshCart])

  useEffect(() => {
    if (!user) return

    const channel = supabase
      .channel('cart-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'carts',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          refreshCart()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user, refreshCart])

  return (
    <CartContext.Provider value={{ cartCount, refreshCart }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
