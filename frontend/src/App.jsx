import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import { WishlistProvider } from './context/WishlistContext'
import { ToastProvider } from './context/ToastContext'

import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ProtectedRoute from './components/ProtectedRoute'

import ProductList from './pages/ProductList'
import ProductDetails from './pages/ProductDetails'
import Login from './pages/Login'
import Register from './pages/Register'
import Account from './pages/Account'
import Cart from './pages/Cart'
import Wishlist from './pages/Wishlist'
import Checkout from './pages/Checkout'
import Orders from './pages/Orders'
import OrderDetails from './pages/OrderDetails'

import SellerRoute from './components/SellerRoute'
import SellerDashboard from './pages/SellerDashboard'
import SellerProducts from './pages/SellerProducts'
import SellerProductForm from './pages/SellerProductForm'
import SellerOrders from './pages/SellerOrders'

import AdminRoute from './components/AdminRoute'
import AdminLayout from './components/AdminLayout'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminUsers from './pages/admin/AdminUsers'
import AdminProducts from './pages/admin/AdminProducts'
import AdminCategories from './pages/admin/AdminCategories'
import AdminOrders from './pages/admin/AdminOrders'
import AdminOrderDetails from './pages/admin/AdminOrderDetails'

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
              
              <Navbar />

              <main style={{ flex: 1, paddingBottom: '40px' }}>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<ProductList />} />
                <Route path="/products/:id" element={<ProductDetails />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                
                {/* Protected Routes */}
                <Route 
                  path="/account" 
                  element={
                    <ProtectedRoute>
                      <Account />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/cart" 
                  element={
                    <ProtectedRoute>
                      <Cart />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/wishlist" 
                  element={
                    <ProtectedRoute>
                      <Wishlist />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/checkout" 
                  element={
                    <ProtectedRoute>
                      <Checkout />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/orders" 
                  element={
                    <ProtectedRoute>
                      <Orders />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/orders/:id" 
                  element={
                    <ProtectedRoute>
                      <OrderDetails />
                    </ProtectedRoute>
                  } 
                />

                {/* Seller Routes */}
                <Route element={<SellerRoute />}>
                  <Route path="/seller" element={<SellerDashboard />} />
                  <Route path="/seller/products" element={<SellerProducts />} />
                  <Route path="/seller/products/new" element={<SellerProductForm />} />
                  <Route path="/seller/products/:id/edit" element={<SellerProductForm />} />
                  <Route path="/seller/orders" element={<SellerOrders />} />
                </Route>
                {/* Admin Routes */}
                <Route path="/admin" element={<AdminRoute />}>
                  <Route element={<AdminLayout />}>
                    <Route index element={<AdminDashboard />} />
                    <Route path="users" element={<AdminUsers />} />
                    <Route path="products" element={<AdminProducts />} />
                    <Route path="categories" element={<AdminCategories />} />
                    <Route path="orders" element={<AdminOrders />} />
                    <Route path="orders/:id" element={<AdminOrderDetails />} />
                  </Route>
                </Route>
              </Routes>
            </main>
            
            <Footer />
          </div>
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
    </ToastProvider>
  )
}

export default App
