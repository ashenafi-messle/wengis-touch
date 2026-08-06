import React from 'react';
import { Product, Order, Message } from '../../types';
import { ShoppingCart, CheckCircle, Clock, DollarSign, MessageSquare, Plus, ArrowUpRight, TrendingUp, Package } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { formatCurrency } from '../../utils/currency';
import { BackButton } from '../BackButton';

interface AdminDashboardProps {
  products: Product[];
  orders: Order[];
  messages: Message[];
  onNavigateTab: (tab: 'products' | 'orders' | 'messages') => void;
  onOpenAddProduct: () => void;
  onBack: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  products,
  orders,
  messages,
  onNavigateTab,
  onOpenAddProduct,
  onBack
}) => {
  const { t } = useLanguage();
  const totalProducts = products.length;
  const availableProducts = products.filter(p => p.available).length;
  const newOrders = orders.filter(o => o.status === 'Pending' || o.status === 'Confirmed').length;
  const completedOrders = orders.filter(o => o.status === 'Delivered').length;
  const totalRevenue = orders
    .filter(o => o.status !== 'Cancelled')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const unreadMessages = messages.filter(m => !m.read).length;

  return (
    <div className="space-y-4 sm:space-y-8 text-left animate-fadeIn">
      
      {/* Back Button */}
      <div className="mb-4">
        <BackButton onClick={onBack} />
      </div>

      {/* Overview Metric Banner Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-5">

        {/* Metric 1: Total Products */}
        <div className="bg-[#142E52] border border-[#C95A1A]/30 p-3 sm:p-5 rounded-xl sm:rounded-2xl text-[#FAF7F1] flex items-center justify-between shadow-lg">
          <div>
            <span className="text-[8px] sm:text-[10px] uppercase font-bold tracking-widest text-[#D8C3A5]">{t('adminDash.totalProducts')}</span>
            <h3 className="font-serif-luxury text-xl sm:text-3xl font-bold text-[#FAF7F1] my-0.5 sm:my-1">{totalProducts}</h3>
            <span className="text-[9px] sm:text-[11px] text-[#C95A1A] font-semibold">{availableProducts} {t('adminDash.inStock')}</span>
          </div>
          <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-[#C95A1A]/20 border border-[#C95A1A]/40 flex items-center justify-center text-[#C95A1A]">
            <ShoppingCart className="w-4 h-4 sm:w-6 sm:h-6" />
          </div>
        </div>

        {/* Metric 2: Total Orders */}
        <div className="bg-[#142E52] border border-[#C95A1A]/30 p-3 sm:p-5 rounded-xl sm:rounded-2xl text-[#FAF7F1] flex items-center justify-between shadow-lg">
          <div>
            <span className="text-[8px] sm:text-[10px] uppercase font-bold tracking-widest text-[#D8C3A5]">{t('adminDash.totalOrders')}</span>
            <h3 className="font-serif-luxury text-xl sm:text-3xl font-bold text-[#FAF7F1] my-0.5 sm:my-1">{orders.length}</h3>
            <span className="text-[9px] sm:text-[11px] text-emerald-400 font-semibold">{newOrders} {t('adminDash.newOrders')}</span>
          </div>
          <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
            <Package className="w-4 h-4 sm:w-6 sm:h-6" />
          </div>
        </div>

        {/* Metric 3: Available Products */}
        <div className="bg-[#142E52] border border-[#C95A1A]/30 p-3 sm:p-5 rounded-xl sm:rounded-2xl text-[#FAF7F1] flex items-center justify-between shadow-lg">
          <div>
            <span className="text-[8px] sm:text-[10px] uppercase font-bold tracking-widest text-[#D8C3A5]">{t('adminDash.available')}</span>
            <h3 className="font-serif-luxury text-xl sm:text-3xl font-bold text-emerald-400 my-0.5 sm:my-1">{availableProducts}</h3>
            <span className="text-[9px] sm:text-[11px] text-gray-400">{t('adminDash.readyToShip')}</span>
          </div>
          <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
            <CheckCircle className="w-4 h-4 sm:w-6 sm:h-6" />
          </div>
        </div>

        {/* Metric 4: Completed Orders */}
        <div className="bg-[#142E52] border border-[#C95A1A]/30 p-3 sm:p-5 rounded-xl sm:rounded-2xl text-[#FAF7F1] flex items-center justify-between shadow-lg">
          <div>
            <span className="text-[8px] sm:text-[10px] uppercase font-bold tracking-widest text-[#D8C3A5]">{t('adminDash.completed')}</span>
            <h3 className="font-serif-luxury text-xl sm:text-3xl font-bold text-[#FAF7F1] my-0.5 sm:my-1">{completedOrders}</h3>
            <span className="text-[9px] sm:text-[11px] text-gray-400">{t('adminDash.delivered')}</span>
          </div>
          <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
            <TrendingUp className="w-4 h-4 sm:w-6 sm:h-6" />
          </div>
        </div>

        {/* Metric 5: Total Revenue */}
        <div className="bg-[#142E52] border border-[#C95A1A]/30 p-3 sm:p-5 rounded-xl sm:rounded-2xl text-[#FAF7F1] flex items-center justify-between shadow-lg">
          <div>
            <span className="text-[8px] sm:text-[10px] uppercase font-bold tracking-widest text-[#D8C3A5]">{t('adminDash.totalRevenue')}</span>
            <h3 className="font-serif-luxury text-xl sm:text-3xl font-bold text-[#C95A1A] my-0.5 sm:my-1">{formatCurrency(totalRevenue)}</h3>
            <span className="text-[9px] sm:text-[11px] text-gray-400">{t('adminDash.allTimeSales')}</span>
          </div>
          <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
            <DollarSign className="w-4 h-4 sm:w-6 sm:h-6" />
          </div>
        </div>

      </div>

      {/* Quick Action Bar & Navigation Shortcuts */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-8">

        {/* Recent Orders Overview Table */}
        <div className="md:col-span-8 bg-[#142E52] p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-[#C95A1A]/30 text-[#FAF7F1] shadow-xl">
          <div className="flex items-center justify-between mb-4 sm:mb-6 pb-3 sm:pb-4 border-b border-white/10">
            <div>
              <h3 className="font-serif-luxury text-lg sm:text-xl font-bold text-[#FAF7F1]">{t('adminDash.recentOrders')}</h3>
              <p className="text-[11px] sm:text-xs text-[#D8C3A5] line-clamp-1 sm:line-clamp-none">{t('adminDash.recentOrdersDesc')}</p>
            </div>
            <button
              onClick={() => onNavigateTab('orders')}
              className="text-[11px] sm:text-xs text-[#C95A1A] font-semibold hover:underline flex items-center space-x-1"
            >
              <span>{t('adminDash.viewAllOrders')} ({orders.length})</span>
              <ArrowUpRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-[10px] sm:text-xs">
              <thead className="bg-[#0F2747] text-[#D8C3A5] uppercase font-bold text-[9px] sm:text-[10px] tracking-wider">
                <tr>
                  <th className="p-2 sm:p-3 rounded-l-lg sm:rounded-l-xl">Order Ref</th>
                  <th className="p-2 sm:p-3">Customer</th>
                  <th className="p-2 sm:p-3">Total</th>
                  <th className="p-2 sm:p-3">Status</th>
                  <th className="p-2 sm:p-3 rounded-r-lg sm:rounded-r-xl text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {orders.slice(0, 4).map(o => (
                  <tr key={o.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-2 sm:p-3 font-mono font-bold text-[#C95A1A] text-[10px] sm:text-xs">{o.orderRef || o.id}</td>
                    <td className="p-2 sm:p-3 font-medium text-[#FAF7F1] text-[10px] sm:text-xs">{o.customerName}</td>
                    <td className="p-2 sm:p-3 font-serif-luxury font-bold text-[#FAF7F1] text-[10px] sm:text-xs">{formatCurrency(o.totalAmount)}</td>
                    <td className="p-2 sm:p-3">
                      <span className={`px-2 py-0.5 sm:px-2.5 sm:py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold ${
                        o.status === 'Pending' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                        o.status === 'Delivered' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' :
                        'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                      }`}>
                        {o.status}
                      </span>
                    </td>
                    <td className="p-2 sm:p-3 text-right text-gray-400 text-[9px] sm:text-[11px]">
                      {new Date(o.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Admin Shortcuts & Recent Messages Panel */}
        <div className="md:col-span-4 space-y-3 sm:space-y-6">

          {/* Quick Action Card */}
          <div className="bg-[#142E52] p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-[#C95A1A]/30 text-[#FAF7F1] shadow-xl space-y-3 sm:space-y-4">
            <h3 className="font-serif-luxury text-base sm:text-lg font-bold">{t('adminDash.quickActions')}</h3>

            <button
              onClick={onOpenAddProduct}
              className="w-full py-2.5 sm:py-3 rounded-lg sm:rounded-xl bg-[#C95A1A] hover:bg-[#A94712] text-[#FAF7F1] text-[11px] sm:text-xs font-bold uppercase tracking-wider flex items-center justify-center space-x-2 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>{t('adminDash.addProduct')}</span>
            </button>

            <button
              onClick={() => onNavigateTab('messages')}
              className="w-full py-2.5 sm:py-3 rounded-lg sm:rounded-xl bg-[#0F2747] hover:bg-black/30 border border-[#C95A1A]/30 text-[#FAF7F1] text-[11px] sm:text-xs font-bold uppercase tracking-wider flex items-center justify-between px-3 sm:px-4 transition-colors cursor-pointer"
            >
              <div className="flex items-center space-x-2">
                <MessageSquare className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#C95A1A]" />
                <span>{t('adminDash.viewMessages')}</span>
              </div>
              {unreadMessages > 0 && (
                <span className="bg-[#C95A1A] text-[#FAF7F1] text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full">
                  {unreadMessages} Unread
                </span>
              )}
            </button>
          </div>

          {/* Activity Timeline */}
          <div className="bg-[#142E52] p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-[#C95A1A]/30 text-[#FAF7F1] shadow-xl">
            <h3 className="font-serif-luxury text-base sm:text-lg font-bold mb-2 sm:mb-3">Atelier Activity Log</h3>
            <div className="space-y-2 sm:space-y-3 text-[11px] sm:text-xs text-[#D8C3A5]">
              <div className="border-l-2 border-[#C95A1A] pl-2 sm:pl-3 py-1">
                <p className="font-bold text-[#FAF7F1] text-[10px] sm:text-xs">New Order Received</p>
                <p className="text-[10px] sm:text-[11px] text-gray-400 line-clamp-1 sm:line-clamp-none">ORD-8821 placed by Claire Dubois</p>
              </div>
              <div className="border-l-2 border-emerald-500 pl-2 sm:pl-3 py-1">
                <p className="font-bold text-[#FAF7F1] text-[10px] sm:text-xs">Product Updated</p>
                <p className="text-[10px] sm:text-[11px] text-gray-400 line-clamp-1 sm:line-clamp-none">Royal Atelier Tote set as Available</p>
              </div>
              <div className="border-l-2 border-blue-500 pl-2 sm:pl-3 py-1">
                <p className="font-bold text-[#FAF7F1] text-[10px] sm:text-xs">Inquiry Received</p>
                <p className="text-[11px] text-gray-400">Bespoke Bridal Commission request</p>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
