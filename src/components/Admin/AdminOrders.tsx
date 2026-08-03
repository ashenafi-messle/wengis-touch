import React, { useState } from 'react';
import { Order, OrderStatus } from '../../types';
import { Search, Filter, Clock, CheckCircle2, Truck, Package, XCircle, Eye, User, Phone, Mail, MapPin, DollarSign } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { formatCurrency } from '../../utils/currency';

interface AdminOrdersProps {
  orders: Order[];
  onUpdateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
}

export const AdminOrders: React.FC<AdminOrdersProps> = ({ orders, onUpdateOrderStatus }) => {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const statuses: OrderStatus[] = ['Pending', 'Confirmed', 'Processing', 'Delivered', 'Cancelled'];

  const filteredOrders = orders.filter(o => {
    const matchesSearch = o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customerEmail.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = selectedStatus === 'All' || o.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadgeClass = (status: OrderStatus) => {
    switch (status) {
      case 'Pending':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'Confirmed':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
      case 'Processing':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
      case 'Delivered':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'Cancelled':
        return 'bg-red-500/20 text-red-300 border-red-500/40';
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-500/40';
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 text-left animate-fadeIn">

      {/* Header */}
      <div className="bg-[#142E52] p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-[#C95A1A]/30 text-[#FAF7F1] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
        <div>
          <h2 className="font-serif-luxury text-xl sm:text-2xl font-bold text-[#FAF7F1]">
            {t('adminOrders.title')}
          </h2>
          <p className="text-[11px] sm:text-xs text-[#D8C3A5] line-clamp-2 sm:line-clamp-none">
            {t('adminOrders.desc')}
          </p>
        </div>

        <div className="text-right">
          <span className="text-[9px] sm:text-[10px] uppercase tracking-widest text-[#D8C3A5]">{t('adminOrders.totalOrders')}</span>
          <span className="font-serif-luxury text-xl sm:text-2xl font-bold text-[#C95A1A] block">{orders.length}</span>
        </div>
      </div>

      {/* Search and Status Filters */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-between items-center bg-[#F3E7D3] p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-[#D8C3A5]">
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#0F2747] absolute left-2.5 sm:left-3 top-2.5 sm:top-3" />
          <input
            type="text"
            placeholder={t('adminOrders.search')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#FAF7F1] border border-[#D8C3A5] rounded-lg sm:rounded-xl pl-8 sm:pl-9 pr-2 sm:pr-3 py-1.5 sm:py-2 text-[11px] sm:text-xs text-[#0F2747] focus:outline-none focus:border-[#C95A1A]"
          />
        </div>

        <div className="flex items-center space-x-1.5 sm:space-x-2 w-full sm:w-auto overflow-x-auto pb-1">
          <button
            onClick={() => setSelectedStatus('All')}
            className={`px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer ${
              selectedStatus === 'All' ? 'bg-[#0F2747] text-[#FAF7F1]' : 'bg-[#FAF7F1] text-[#0F2747]'
            }`}
          >
            {t('adminOrders.all')} ({orders.length})
          </button>
          {statuses.map(st => (
            <button
              key={st}
              onClick={() => setSelectedStatus(st)}
              className={`px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer ${
                selectedStatus === st ? 'bg-[#C95A1A] text-[#FAF7F1]' : 'bg-[#FAF7F1] text-[#0F2747]'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-[#142E52] rounded-3xl border border-[#C95A1A]/30 overflow-hidden shadow-xl text-[#FAF7F1]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0F2747] text-[#D8C3A5] uppercase font-bold text-[10px] tracking-wider border-b border-white/10">
              <tr>
                <th className="p-4">Order Ref</th>
                <th className="p-4">Customer Info</th>
                <th className="p-4">Items Count</th>
                <th className="p-4">Total Amount</th>
                <th className="p-4">Current Status</th>
                <th className="p-4">Order Date</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredOrders.map(o => (
                <tr key={o.id} className="hover:bg-white/5 transition-colors">
                  <td className="p-4 font-mono font-bold text-[#C95A1A]">{o.id}</td>
                  
                  <td className="p-4">
                    <span className="font-bold text-[#FAF7F1] block">{o.customerName}</span>
                    <span className="text-[11px] text-[#D8C3A5] block">{o.customerEmail}</span>
                  </td>

                  <td className="p-4 text-xs font-medium">
                    {o.items.reduce((s, i) => s + i.quantity, 0)} items
                  </td>

                  <td className="p-4 font-serif-luxury text-base font-bold text-[#FAF7F1]">
                    {formatCurrency(o.totalAmount)}
                  </td>

                  <td className="p-4">
                    <select
                      value={o.status}
                      onChange={(e) => onUpdateOrderStatus(o.id, e.target.value as OrderStatus)}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border focus:outline-none cursor-pointer ${getStatusBadgeClass(o.status)}`}
                    >
                      {statuses.map(st => (
                        <option key={st} value={st} className="bg-[#0F2747] text-[#FAF7F1]">
                          {st}
                        </option>
                      ))}
                    </select>
                  </td>

                  <td className="p-4 text-gray-400 text-[11px]">
                    {new Date(o.createdAt).toLocaleDateString()}
                  </td>

                  <td className="p-4 text-right">
                    <button
                      onClick={() => setSelectedOrder(o)}
                      className="px-3 py-1.5 rounded-xl bg-[#0F2747] text-[#D8C3A5] hover:text-[#C95A1A] transition-colors cursor-pointer flex items-center space-x-1 ml-auto"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Details</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Drawer Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="bg-[#0F2747] border border-[#C95A1A]/40 text-[#FAF7F1] p-6 sm:p-8 rounded-3xl max-w-xl w-full my-8 space-y-6 shadow-2xl relative text-left">
            
            <div className="flex justify-between items-center border-b border-white/10 pb-4">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#C95A1A]">Order Details</span>
                <h3 className="font-serif-luxury text-2xl font-bold text-[#FAF7F1]">{selectedOrder.id}</h3>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="text-gray-400 hover:text-white text-lg">✕</button>
            </div>

            {/* Customer Contact Box */}
            <div className="bg-[#142E52] p-4 rounded-2xl border border-[#C95A1A]/20 space-y-2 text-xs text-[#D8C3A5]">
              <div className="flex items-center space-x-2 text-[#FAF7F1] font-bold">
                <User className="w-4 h-4 text-[#C95A1A]" />
                <span>{selectedOrder.customerName}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-3.5 h-3.5 text-[#C95A1A]" />
                <span>{selectedOrder.customerEmail}</span>
              </div>
              {selectedOrder.customerPhone && (
                <div className="flex items-center space-x-2">
                  <Phone className="w-3.5 h-3.5 text-[#C95A1A]" />
                  <span>{selectedOrder.customerPhone}</span>
                </div>
              )}
              <div className="flex items-start space-x-2">
                <MapPin className="w-3.5 h-3.5 text-[#C95A1A] shrink-0 mt-0.5" />
                <span>{selectedOrder.shippingAddress}</span>
              </div>
            </div>

            {/* Items Ordered Breakdown */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#D8C3A5]">Ordered Items</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                {selectedOrder.items.map((item, idx) => (
                  <div key={idx} className="bg-[#142E52] p-3 rounded-xl flex items-center justify-between border border-white/5">
                    <div className="flex items-center space-x-3">
                      <img src={item.productImage} alt={item.productTitle} className="w-10 h-10 rounded-lg object-cover" referrerPolicy="no-referrer" />
                      <div>
                        <span className="font-bold text-[#FAF7F1] text-xs block">{item.productTitle}</span>
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center space-x-1">
                            <div 
                              className="w-3 h-3 rounded-full border border-white/30"
                              style={{ backgroundColor: '#0F2747' }}
                            />
                            <span className="text-[10px] text-[#C95A1A]">{item.color}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <span className="font-serif-luxury font-bold text-[#FAF7F1]">
                      {item.quantity}x {formatCurrency(item.price)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Total and Notes */}
            <div className="p-4 bg-[#142E52] rounded-2xl border border-white/10 space-y-2 text-xs">
              <div className="flex justify-between font-bold text-[#FAF7F1]">
                <span>Payment Method:</span>
                <span className="text-[#D8C3A5]">{selectedOrder.paymentMethod}</span>
              </div>
              <div className="flex justify-between font-bold text-[#FAF7F1]">
                <span>Delivery Option:</span>
                <span className="text-[#D8C3A5]">{selectedOrder.deliveryPreference}</span>
              </div>
              {selectedOrder.specialNotes && (
                <div className="pt-2 border-t border-white/10 text-[11px] italic text-[#D8C3A5]">
                  Note: "{selectedOrder.specialNotes}"
                </div>
              )}
              <div className="flex justify-between items-center pt-2 border-t border-white/10 font-bold text-sm">
                <span className="text-[#FAF7F1]">Total Amount Paid:</span>
                <span className="font-serif-luxury text-xl text-[#C95A1A]">{formatCurrency(selectedOrder.totalAmount)}</span>
              </div>
            </div>

            <button
              onClick={() => setSelectedOrder(null)}
              className="w-full py-3 rounded-full bg-[#C95A1A] hover:bg-[#A94712] text-[#FAF7F1] text-xs font-semibold uppercase tracking-wider"
            >
              Close Details
            </button>

          </div>
        </div>
      )}

    </div>
  );
};
