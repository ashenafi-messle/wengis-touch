'use client';

import React, { useState, useEffect } from 'react';
import { Product, Order, Message, CartItem, AdminSession, OrderStatus } from './types';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { ProductShowcase } from './components/ProductShowcase';
import { ProductDetailsModal } from './components/ProductDetailsModal';
import { OrderModal } from './components/OrderModal';
import { CartDrawer } from './components/CartDrawer';
import { BrandStory } from './components/BrandStory';
import { ContactPage } from './components/ContactPage';
import { Footer } from './components/Footer';

// Admin Components
import { AdminLogin } from './components/Admin/AdminLogin';
import { AdminDashboard } from './components/Admin/AdminDashboard';
import { AdminProducts } from './components/Admin/AdminProducts';
import { AdminOrders } from './components/Admin/AdminOrders';
import { AdminMessages } from './components/Admin/AdminMessages';

import { LayoutDashboard, Package, ShoppingCart, MessageSquare, LogOut, Lock } from 'lucide-react';

export default function App() {
  // Main App Navigation State
  const [activeTab, setActiveTab] = useState<'home' | 'contact' | 'admin'>('home');
  const [searchQuery, setSearchQuery] = useState('');

  // Admin Portal Sub-tab State
  const [adminTab, setAdminTab] = useState<'dashboard' | 'products' | 'orders' | 'messages'>('dashboard');

  // App Data Stores
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Shopping Bag / Cart State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);

  // Selected Product for Details Modal
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedProductInitialIndex, setSelectedProductInitialIndex] = useState<number>(0);

  // Admin Add Product Modal State
  const [isAdminAddProductOpen, setIsAdminAddProductOpen] = useState(false);

  // Admin Session State (Persisted in localStorage)
  const [adminSession, setAdminSession] = useState<AdminSession>({ isAuthenticated: false });
  
  // Load admin session from localStorage on client-side mount
  useEffect(() => {
    const saved = localStorage.getItem('wengi_admin_session');
    if (saved) {
      try {
        setAdminSession(JSON.parse(saved));
      } catch (e) {
        // ignore fallback
      }
    }
  }, []);

  // Navigate tab while synchronizing browser history URL hash
  const navigateToTab = (tab: 'home' | 'contact' | 'admin') => {
    setActiveTab(tab);
    if (typeof window !== 'undefined') {
      const hash = tab === 'home' ? '' : `#${tab}`;
      const newUrl = hash ? `${window.location.pathname}${hash}` : window.location.pathname;
      window.history.pushState({ tab }, '', newUrl);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Sync browser back/forward buttons and mobile gestures via popstate
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const initialHash = window.location.hash.replace('#', '');
      if (initialHash === 'contact' || initialHash === 'admin') {
        setActiveTab(initialHash as 'contact' | 'admin');
      }
    }

    const handlePopState = (e: PopStateEvent) => {
      // 1. Dismiss open modals first on back gesture
      if (selectedProduct) {
        setSelectedProduct(null);
        return;
      }
      if (isOrderModalOpen) {
        setIsOrderModalOpen(false);
        return;
      }
      if (isCartOpen) {
        setIsCartOpen(false);
        return;
      }

      // 2. Navigate tab
      const targetTab = e.state?.tab || (window.location.hash ? window.location.hash.replace('#', '') : 'home');
      if (targetTab === 'contact' || targetTab === 'admin' || targetTab === 'home') {
        setActiveTab(targetTab as 'home' | 'contact' | 'admin');
      } else {
        setActiveTab('home');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [selectedProduct, isOrderModalOpen, isCartOpen]);

  // Fast first-visit data loading: fetch products immediately so customer view renders with zero blocking delay
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const res = await fetch('/api/products');
        if (res.ok) {
          const productsData = await res.json();
          setProducts(productsData);
        }
      } catch (err) {
        console.error('Failed to fetch products', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Lazily fetch admin-specific data (orders & messages) only when viewing admin portal
  useEffect(() => {
    if (activeTab === 'admin' || adminSession.isAuthenticated) {
      const fetchAdminData = async () => {
        try {
          const [ordersRes, messagesRes] = await Promise.all([
            fetch('/api/orders'),
            fetch('/api/messages')
          ]);
          if (ordersRes.ok) {
            setOrders(await ordersRes.json());
          }
          if (messagesRes.ok) {
            setMessages(await messagesRes.json());
          }
        } catch (err) {
          console.error('Failed to fetch admin data', err);
        }
      };

      fetchAdminData();
    }
  }, [activeTab, adminSession.isAuthenticated]);

  // Cart Management Functions
  const handleAddToCart = (product: Product, selectedColor: string, preferredImage?: string) => {
    const itemProduct = preferredImage && product.images?.includes(preferredImage)
      ? { ...product, images: [preferredImage, ...product.images.filter(img => img !== preferredImage)] }
      : product;

    setCart(prev => {
      const existingIdx = prev.findIndex(
        i => i.product.id === product.id && i.selectedColor === selectedColor && i.product.images[0] === itemProduct.images[0]
      );
      if (existingIdx > -1) {
        const updated = [...prev];
        updated[existingIdx].quantity += 1;
        return updated;
      }
      return [...prev, { product: itemProduct, selectedColor, quantity: 1 }];
    });
  };

  const handleAddToCartWithSpecs = (product: Product, selectedColor: string, quantity: number, preferredImage?: string) => {
    const itemProduct = preferredImage && product.images?.includes(preferredImage)
      ? { ...product, images: [preferredImage, ...product.images.filter(img => img !== preferredImage)] }
      : product;

    setCart(prev => {
      const existingIdx = prev.findIndex(
        i => i.product.id === product.id && i.selectedColor === selectedColor && i.product.images[0] === itemProduct.images[0]
      );
      if (existingIdx > -1) {
        const updated = [...prev];
        updated[existingIdx].quantity += quantity;
        return updated;
      }
      return [...prev, { product: itemProduct, selectedColor, quantity }];
    });
  };

  const handleUpdateCartQuantity = (index: number, newQty: number) => {
    setCart(prev => {
      const updated = [...prev];
      updated[index].quantity = newQty;
      return updated;
    });
  };

  const handleRemoveCartItem = (index: number) => {
    setCart(prev => prev.filter((_, i) => i !== index));
  };

  const handleOrderSuccess = (newOrder: Order) => {
    setOrders(prev => [newOrder, ...prev]);
    setCart([]); // Clear shopping bag on order submission
  };

  // Admin Operations
  const handleAdminLoginSuccess = (session: AdminSession) => {
    setAdminSession(session);
    localStorage.setItem('wengi_admin_session', JSON.stringify(session));
  };

  const handleAdminLogout = () => {
    setAdminSession({ isAuthenticated: false });
    localStorage.removeItem('wengi_admin_session');
  };

  const handleAddProduct = async (prodData: Omit<Product, 'id' | 'createdAt'>) => {
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(prodData)
      });
      if (res.ok) {
        const newProd = await res.json();
        setProducts(prev => [newProd, ...prev]);
      }
    } catch (err) {
      console.error('Error adding product', err);
    }
  };

  const handleUpdateProduct = async (id: string, updatedFields: Partial<Product>) => {
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedFields)
      });
      if (res.ok) {
        const updated = await res.json();
        setProducts(prev => prev.map(p => (p.id === id ? updated : p)));
      }
    } catch (err) {
      console.error('Error updating product', err);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setProducts(prev => prev.filter(p => p.id !== id));
      }
    } catch (err) {
      console.error('Error deleting product', err);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: OrderStatus) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        const updated = await res.json();
        setOrders(prev => prev.map(o => (o.id === orderId ? updated : o)));
      }
    } catch (err) {
      console.error('Error updating order status', err);
    }
  };

  const handleToggleReadMessage = async (id: string, currentRead: boolean) => {
    try {
      const res = await fetch(`/api/messages/${id}/read`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ read: !currentRead })
      });
      if (res.ok) {
        const updated = await res.json();
        setMessages(prev => prev.map(m => (m.id === id ? updated : m)));
      }
    } catch (err) {
      console.error('Error toggling message read', err);
    }
  };

  const handleDeleteMessage = async (id: string) => {
    try {
      const res = await fetch(`/api/messages/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setMessages(prev => prev.filter(m => m.id !== id));
      }
    } catch (err) {
      console.error('Error deleting message', err);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F1] text-[#1E1E1E] flex flex-col font-sans selection:bg-[#C95A1A] selection:text-[#FAF7F1]">
      
      {/* Top Header Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={navigateToTab}
        cart={cart}
        setIsCartOpen={setIsCartOpen}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        isLoggedIn={adminSession.isAuthenticated}
      />

      {/* Main View Router */}
      <main className="flex-1">
        
        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center min-h-[50vh]">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-[#C95A1A] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-[#D8C3A5] text-sm">Loading...</p>
            </div>
          </div>
        )}
        
        {/* Customer Public Website: Home / Collection */}
        {!isLoading && activeTab === 'home' && (
          <div>
            <HeroSection
              onExploreClick={() => {
                const el = document.getElementById('collection-showcase');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              onCustomRequestClick={() => navigateToTab('contact')}
              products={products}
            />

            <ProductShowcase
              products={products}
              onSelectProduct={(p, imgIdx = 0) => {
                setSelectedProduct(p);
                setSelectedProductInitialIndex(imgIdx);
                if (typeof window !== 'undefined') {
                  window.history.pushState({ modal: 'product', productId: p.id }, '', window.location.href);
                }
              }}
              onAddToCart={(product, color, preferredImg) => handleAddToCart(product, color, preferredImg)}
              searchQuery={searchQuery}
            />

            <BrandStory />
          </div>
        )}

        {/* Customer Public Website: Contact Page */}
        {!isLoading && activeTab === 'contact' && (
          <ContactPage onBack={() => navigateToTab('home')} />
        )}

        {/* Protected Admin Portal */}
        {!isLoading && activeTab === 'admin' && (
          <div className="min-h-[85vh] bg-[#0F2747] text-[#FAF7F1] py-10 px-4 sm:px-6 lg:px-8">
            {!adminSession.isAuthenticated ? (
              <AdminLogin
                session={adminSession}
                onLoginSuccess={handleAdminLoginSuccess}
                onBack={() => navigateToTab('home')}
              />
            ) : (
              <div className="max-w-7xl mx-auto space-y-8">
                
                {/* Admin Sub-navigation Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-[#C95A1A]/30 gap-4">
                  <div className="text-left">
                    <span className="text-[10px] tracking-[0.25em] text-[#C95A1A] font-bold uppercase block">
                      Protected Admin Portal
                    </span>
                    <h1 className="font-serif-luxury text-3xl font-bold text-[#FAF7F1]">
                      Wengi's Atelier Control Center
                    </h1>
                  </div>

                  {/* Admin Sub-tab Buttons */}
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => setAdminTab('dashboard')}
                      className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center space-x-1.5 transition-colors cursor-pointer ${
                        adminTab === 'dashboard' ? 'bg-[#C95A1A] text-[#FAF7F1]' : 'bg-[#142E52] text-[#D8C3A5] hover:text-[#FAF7F1]'
                      }`}
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      <span>Dashboard</span>
                    </button>

                    <button
                      onClick={() => setAdminTab('products')}
                      className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center space-x-1.5 transition-colors cursor-pointer ${
                        adminTab === 'products' ? 'bg-[#C95A1A] text-[#FAF7F1]' : 'bg-[#142E52] text-[#D8C3A5] hover:text-[#FAF7F1]'
                      }`}
                    >
                      <Package className="w-4 h-4" />
                      <span>Products ({products.length})</span>
                    </button>

                    <button
                      onClick={() => setAdminTab('orders')}
                      className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center space-x-1.5 transition-colors cursor-pointer ${
                        adminTab === 'orders' ? 'bg-[#C95A1A] text-[#FAF7F1]' : 'bg-[#142E52] text-[#D8C3A5] hover:text-[#FAF7F1]'
                      }`}
                    >
                      <ShoppingCart className="w-4 h-4" />
                      <span>Orders ({orders.length})</span>
                    </button>

                    <button
                      onClick={() => setAdminTab('messages')}
                      className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center space-x-1.5 transition-colors cursor-pointer ${
                        adminTab === 'messages' ? 'bg-[#C95A1A] text-[#FAF7F1]' : 'bg-[#142E52] text-[#D8C3A5] hover:text-[#FAF7F1]'
                      }`}
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>Messages ({messages.length})</span>
                    </button>

                    <button
                      onClick={handleAdminLogout}
                      className="px-3 py-2 rounded-xl bg-red-900/40 text-red-300 hover:bg-red-800 text-xs font-bold uppercase flex items-center space-x-1 cursor-pointer transition-colors"
                      title="Log Out"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Exit</span>
                    </button>
                  </div>
                </div>

                {/* Sub-tab Views */}
                {adminTab === 'dashboard' && (
                  <AdminDashboard
                    products={products}
                    orders={orders}
                    messages={messages}
                    onNavigateTab={(tab) => setAdminTab(tab)}
                    onOpenAddProduct={() => {
                      setAdminTab('products');
                      setIsAdminAddProductOpen(true);
                    }}
                    onBack={() => navigateToTab('home')}
                  />
                )}

                {adminTab === 'products' && (
                  <AdminProducts
                    products={products}
                    onAddProduct={handleAddProduct}
                    onUpdateProduct={handleUpdateProduct}
                    onDeleteProduct={handleDeleteProduct}
                    isAddOpen={isAdminAddProductOpen}
                    setIsAddOpen={setIsAdminAddProductOpen}
                    onBack={() => navigateToTab('home')}
                  />
                )}

                {adminTab === 'orders' && (
                  <AdminOrders
                    orders={orders}
                    onUpdateOrderStatus={handleUpdateOrderStatus}
                    onBack={() => navigateToTab('home')}
                  />
                )}

                {adminTab === 'messages' && (
                  <AdminMessages
                    messages={messages}
                    onToggleReadMessage={handleToggleReadMessage}
                    onDeleteMessage={handleDeleteMessage}
                    onBack={() => navigateToTab('home')}
                  />
                )}

              </div>
            )}
          </div>
        )}

      </main>

      {/* Product Quick Details Modal */}
      <ProductDetailsModal
        product={selectedProduct}
        initialImageIndex={selectedProductInitialIndex}
        onClose={() => setSelectedProduct(null)}
        onAddToCartWithSpecs={handleAddToCartWithSpecs}
      />

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onProceedToCheckout={() => setIsOrderModalOpen(true)}
      />

      {/* Direct Order / Checkout Form Modal */}
      <OrderModal
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
        cartItems={cart}
        onOrderSuccess={handleOrderSuccess}
      />

      {/* Global Footer */}
      <Footer setActiveTab={navigateToTab} />

    </div>
  );
}
