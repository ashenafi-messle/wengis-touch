import React from 'react';
import { Order } from '../types';
import { X, Package, Clock, CheckCircle, Truck, XCircle, User, Mail, Phone, MapPin, Calendar } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { formatCurrency } from '../utils/currency';

interface OrderDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  orders: Order[];
}

export const OrderDrawer: React.FC<OrderDrawerProps> = ({
  isOpen,
  onClose,
  orders
}) => {
  const { language, t } = useLanguage();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Pending':
        return <Clock className="w-4 h-4 text-amber-400" />;
      case 'Confirmed':
        return <CheckCircle className="w-4 h-4 text-blue-400" />;
      case 'Processing':
        return <Package className="w-4 h-4 text-purple-400" />;
      case 'Delivered':
        return <Truck className="w-4 h-4 text-emerald-400" />;
      case 'Cancelled':
        return <XCircle className="w-4 h-4 text-red-400" />;
      default:
        return <Package className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-[#0F2747] border-l border-[#C95A1A]/30 shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-[#C95A1A]/20 bg-[#142E52]">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-[#C95A1A]/20 border border-[#C95A1A]/40 flex items-center justify-center">
              <Package className="w-5 h-5 text-[#C95A1A]" />
            </div>
            <div>
              <h2 className="font-serif-luxury text-lg sm:text-xl font-bold text-[#FAF7F1]">
                {language === 'am' ? 'የትእዛዝ ዝርዝር' : 'Order List'}
              </h2>
              <p className="text-xs text-[#D8C3A5]">
                {orders.length} {language === 'am' ? 'ትዕዛዛት' : 'orders'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#D8C3A5] hover:text-[#FAF7F1] hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Orders List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <Package className="w-16 h-16 text-[#C95A1A]/30 mb-4" />
              <h3 className="font-serif-luxury text-lg font-bold text-[#D8C3A5] mb-2">
                {language === 'am' ? 'የትእዛዝ ዝርዝርዎ ባዶ ነው' : 'Your order list is currently empty'}
              </h3>
              <p className="text-sm text-[#D8C3A5]/70">
                {language === 'am' ? 'የእጅ የክሮሼት ስራዎቻችንን ይጎብኙ እና እቃዎችን ለማዘዝ ይዘዙ የሚለውን ይጫኑ።' : 'Explore our handcrafted crochet collection and click Order to add pieces.'}
              </p>
            </div>
          ) : (
            orders.map((order) => (
              <div
                key={order.id}
                className="bg-[#142E52] border border-[#C95A1A]/20 rounded-xl p-4 sm:p-5 space-y-3 hover:border-[#C95A1A]/40 transition-colors"
              >
                {/* Order Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(order.status)}
                    <div>
                      <p className="font-mono text-xs text-[#C95A1A] font-bold">
                        {order.orderRef || order.id}
                      </p>
                      <p className="text-[10px] text-[#D8C3A5]">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase border ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </div>

                {/* Customer Info */}
                <div className="space-y-1.5 pt-2 border-t border-white/10">
                  <div className="flex items-center space-x-2 text-xs text-[#D8C3A5]">
                    <User className="w-3.5 h-3.5 text-[#C95A1A]" />
                    <span className="text-[#FAF7F1] font-medium">{order.customerName}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-[#D8C3A5]">
                    <Mail className="w-3.5 h-3.5 text-[#C95A1A]" />
                    <span>{order.customerEmail}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-[#D8C3A5]">
                    <Phone className="w-3.5 h-3.5 text-[#C95A1A]" />
                    <span>{order.customerPhone}</span>
                  </div>
                </div>

                {/* Order Items Summary */}
                <div className="pt-2 border-t border-white/10">
                  <p className="text-xs text-[#D8C3A5] mb-2">
                    {order.items.length} {language === 'am' ? 'እቃዎች' : 'items'}
                  </p>
                  <div className="space-y-1.5">
                    {order.items.slice(0, 2).map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs">
                        <div className="flex-1">
                          <span className="text-[#FAF7F1]/80 block">
                            {item.quantity}x {item.productTitle}
                          </span>
                          <div className="flex items-center space-x-1 mt-0.5">
                            <div 
                              className="w-2 h-2 rounded-full border border-white/30"
                              style={{ backgroundColor: item.colorHex || '#0F2747' }}
                            />
                            <span className="text-[#D8C3A5] text-[10px]">{item.color}</span>
                          </div>
                        </div>
                        <span className="text-[#C95A1A] font-medium ml-2">
                          {formatCurrency(item.price * item.quantity)}
                        </span>
                      </div>
                    ))}
                    {order.items.length > 2 && (
                      <p className="text-xs text-[#D8C3A5] italic">
                        +{order.items.length - 2} {language === 'am' ? 'ተጨማሪ እቃዎች' : 'more items'}
                      </p>
                    )}
                  </div>
                </div>

                {/* Total */}
                <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                  <span className="text-xs text-[#D8C3A5]">
                    {language === 'am' ? 'ጠቅላላ' : 'Total'}
                  </span>
                  <span className="font-serif-luxury text-base font-bold text-[#C95A1A]">
                    {formatCurrency(order.totalAmount)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-6 border-t border-[#C95A1A]/20 bg-[#142E52]">
          <div className="flex items-center justify-between text-sm">
            <span className="text-[#D8C3A5]">
              {language === 'am' ? 'ጠቅላላ ዋጋ' : 'Total Value'}
            </span>
            <span className="font-serif-luxury text-lg font-bold text-[#C95A1A]">
              {formatCurrency(orders.reduce((sum, order) => sum + order.totalAmount, 0))}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};