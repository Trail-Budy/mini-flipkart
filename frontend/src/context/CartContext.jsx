import { createContext, useState, useEffect, useContext } from 'react';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cartCount, setCartCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchCartCount();
    } else {
      setCartCount(0);
    }
  }, [user]);

  const fetchCartCount = async () => {
    try {
      const res = await fetch((import.meta.env.VITE_API_URL || '') + '/api/cart/count');
      if (res.ok) {
        const data = await res.json();
        setCartCount(data.count);
      }
    } catch (error) {
      console.error('Error fetching cart count:', error);
    }
  };

  const addToCart = async (productId, quantity = 1) => {
    if (!user) throw new Error('Please login to add items to your cart');
    
    setLoading(true);
    try {
      const res = await fetch((import.meta.env.VITE_API_URL || '') + '/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: productId, quantity })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      await fetchCartCount();
      return true;
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (productId, quantity) => {
    setLoading(true);
    try {
      const res = await fetch((import.meta.env.VITE_API_URL || '') + `/api/cart/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      await fetchCartCount();
      return true;
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (productId) => {
    setLoading(true);
    try {
      const res = await fetch((import.meta.env.VITE_API_URL || '') + `/api/cart/${productId}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      await fetchCartCount();
      return true;
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    setLoading(true);
    try {
      const res = await fetch((import.meta.env.VITE_API_URL || '') + '/api/cart', { method: 'DELETE' });
      if (res.ok) {
        setCartCount(0);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <CartContext.Provider value={{ cartCount, fetchCartCount, addToCart, updateQuantity, removeFromCart, clearCart, loading }}>
      {children}
    </CartContext.Provider>
  );
};
