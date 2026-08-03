import React, { useState } from 'react';
import { CartItem, Order, OrderItem } from '../types';
import { X, CheckCircle, Truck, CreditCard, ShieldCheck, ShoppingCart, ArrowRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { formatCurrency } from '../utils/currency';

interface OrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onOrderSuccess: (newOrder: Order) => void;
}

export const OrderModal: React.FC<OrderModalProps> = ({
  isOpen,
  onClose,
  cartItems,
  onOrderSuccess
}) => {
  if (!isOpen) return null;

  const { language, t } = useLanguage();
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [deliveryPreference, setDeliveryPreference] = useState(language === 'am' ? '3 ቀን' : '3 Days');
  
  const [loading, setLoading] = useState(false);
  const [submittedOrder, setSubmittedOrder] = useState<Order | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const totalAmount = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  const deliveryDaysOptions = Array.from({ length: 30 }, (_, i) => 
    language === 'am' ? `${i + 1} ቀን` : `${i + 1} Day${i + 1 > 1 ? 's' : ''}`
  );

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerPhone) {
      setErrorMessage(language === 'am' ? 'እባክዎ ስምዎን እና ስልክ ቁጥርዎን ያሟሉ።' : 'Please fill in your name and phone number.');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    const formattedItems: OrderItem[] = cartItems.map(ci => ({
      productId: ci.product.id,
      productTitle: ci.product.title,
      productImage: ci.product.images[0],
      color: ci.selectedColor,
      colorHex: '#0F2747',
      quantity: ci.quantity,
      price: ci.product.price
    }));

    const orderPayload = {
      customerName,
      customerEmail: `${customerName.toLowerCase().replace(/\s+/g, '') || 'customer'}@order.com`,
      customerPhone,
      shippingAddress: `Phone Contact: ${customerPhone}`,
      items: formattedItems,
      totalAmount,
      deliveryPreference,
      paymentMethod: 'Standard Order',
      specialNotes: ''
    };

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload)
      });
      const data = await res.json();
      if (res.ok) {
        setSubmittedOrder(data);
        onOrderSuccess(data);
      } else {
        setErrorMessage(data.message || (language === 'am' ? 'ትእዛዙን ማስገባት አልተቻለም። እባክዎ እንደገና ይሞክሩ።' : 'Failed to place order. Please try again.'));
      }
    } catch (err) {
      setErrorMessage(language === 'am' ? 'ከሰርቨር ጋር መገናኘት አልተቻለም።' : 'Error connecting to server. Please check your network.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F2747]/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-[#FAF7F1] w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl border border-[#C95A1A]/30 relative animate-fadeIn my-8 text-left">
        
        {/* Header */}
        <div className="bg-[#0F2747] px-6 py-5 flex items-center justify-between border-b border-[#C95A1A]/30">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-[#C95A1A] flex items-center justify-center text-[#FAF7F1]">
              <ShoppingCart className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif-luxury text-xl font-bold text-[#FAF7F1]">
                {submittedOrder ? (language === 'am' ? 'ትእዛዝዎ ተረጋግጧል' : 'Order Confirmed') : t('modal.orderTitle')}
              </h3>
              <p className="text-[11px] text-[#D8C3A5]">
                {submittedOrder ? (language === 'am' ? 'ወንጊስ ታች ስለመረጡ እናመሰግናለን' : 'Thank you for choosing Wengi\'s Touch') : (language === 'am' ? 'የእጅ ጥበብ ትእዛዝ' : 'Bespoke Handcrafted Order')}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#142E52] text-[#FAF7F1] hover:bg-[#C95A1A] transition-colors flex items-center justify-center cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        {submittedOrder ? (
          <div className="p-8 text-center space-y-6">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600 shadow-md">
              <CheckCircle className="w-10 h-10" />
            </div>

            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-[#C95A1A]">
                {language === 'am' ? 'የትእዛዝ መለያ ቁጥር' : 'Order Reference Code'}
              </span>
              <h2 className="font-serif-luxury text-3xl font-bold text-[#0F2747] my-1">
                {submittedOrder.id}
              </h2>
              <p className="text-xs text-[#1E1E1E]/70 font-light max-w-md mx-auto mt-2">
                {language === 'am' 
                  ? `ትእዛዝዎ ደርሶናል! ጥበበኞቻችን ምርትዎን እያዘጋጁ ነው። በቅርቡ በስልክ ቁጥርዎ ` + submittedOrder.customerPhone + ` እንደውላለን።`
                  : `We have received your order request! Our master artisans are preparing your bespoke piece. We will contact you at ${submittedOrder.customerPhone}.`}
              </p>
            </div>

            {/* Order Details Summary Box */}
            <div className="bg-[#F3E7D3] p-5 rounded-2xl border border-[#D8C3A5] text-left space-y-3">
              <div className="flex justify-between text-xs border-b border-black/10 pb-2 font-medium text-[#0F2747]">
                <span>{t('modal.name')}:</span>
                <span>{submittedOrder.customerName}</span>
              </div>
              <div className="flex justify-between text-xs border-b border-black/10 pb-2 font-medium text-[#0F2747]">
                <span>{t('modal.phone')}:</span>
                <span>{submittedOrder.customerPhone}</span>
              </div>
              <div className="flex justify-between text-xs border-b border-black/10 pb-2 font-medium text-[#0F2747]">
                <span>{t('modal.delivery')}:</span>
                <span>{submittedOrder.deliveryPreference}</span>
              </div>
              <div className="flex justify-between text-xs font-bold text-[#0F2747] pt-1">
                <span>{t('modal.total')}:</span>
                <span className="text-[#C95A1A] text-base font-serif-luxury">{formatCurrency(submittedOrder.totalAmount)}</span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="px-8 py-3 rounded-full bg-[#0F2747] hover:bg-[#142E52] text-[#FAF7F1] text-xs font-semibold uppercase tracking-wider transition-colors shadow-md cursor-pointer"
            >
              {language === 'am' ? 'ወደ መደብሩ ተመለስ' : 'Back to Store'}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmitOrder} className="p-6 sm:p-8 space-y-6">
            
            {errorMessage && (
              <div className="p-3 rounded-xl bg-red-100 text-red-800 text-xs font-medium border border-red-200">
                {errorMessage}
              </div>
            )}

            {/* Order Items Overview */}
            <div className="bg-[#F3E7D3] p-4 rounded-2xl border border-[#D8C3A5] space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#0F2747]">
                {language === 'am' ? `በትእዛዝዎ ውስጥ ያሉ እቃዎች (${cartItems.length})` : `Items in Order (${cartItems.length})`}
              </h4>
              <div className="max-h-36 overflow-y-auto space-y-2 pr-2">
                {cartItems.map((item, i) => (
                  <div key={i} className="flex items-center justify-between text-xs bg-[#FAF7F1] p-2.5 rounded-xl border border-[#D8C3A5]/50">
                    <div className="flex items-center space-x-3">
                      <img src={item.product.images[0]} alt={item.product.title} className="w-10 h-10 rounded-lg object-cover" referrerPolicy="no-referrer" />
                      <div>
                        <span className="font-semibold text-[#0F2747] block truncate max-w-[180px]">{item.product.title}</span>
                        <div className="flex items-center space-x-1 mt-0.5">
                          <span className="text-[10px] text-[#C95A1A]">{item.selectedColor}</span>
                        </div>
                      </div>
                    </div>
                    <span className="font-serif-luxury font-bold text-[#0F2747]">
                      {item.quantity}x {formatCurrency(item.product.price)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-black/10 text-xs font-bold text-[#0F2747]">
                <span>{t('modal.total')}:</span>
                <span className="text-lg font-serif-luxury text-[#C95A1A]">{formatCurrency(totalAmount)}</span>
              </div>
            </div>

            {/* Customer Details Form Fields */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#0F2747] border-b border-[#0F2747]/10 pb-1">
                {language === 'am' ? 'የትእዛዝ መረጃ' : 'Order Information'}
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-semibold text-[#0F2747] uppercase block mb-1">
                    {t('modal.name')} *
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder={language === 'am' ? 'ሙሉ ስምዎን ያስገቡ' : 'Enter your full name'}
                    className="w-full bg-[#FAF7F1] border border-[#D8C3A5] rounded-xl px-3.5 py-2.5 text-xs text-[#0F2747] focus:outline-none focus:border-[#C95A1A]"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-[#0F2747] uppercase block mb-1">
                    {t('modal.phone')} *
                  </label>
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder={language === 'am' ? 'ስልክ ቁጥርዎን ያስገቡ' : 'Enter your phone number'}
                    className="w-full bg-[#FAF7F1] border border-[#D8C3A5] rounded-xl px-3.5 py-2.5 text-xs text-[#0F2747] focus:outline-none focus:border-[#C95A1A]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-[#0F2747] uppercase block mb-1">
                  {t('modal.delivery')} *
                </label>
                <select
                  value={deliveryPreference}
                  onChange={(e) => setDeliveryPreference(e.target.value)}
                  className="w-full bg-[#FAF7F1] border border-[#D8C3A5] rounded-xl px-3.5 py-2.5 text-xs text-[#0F2747] focus:outline-none focus:border-[#C95A1A]"
                >
                  {deliveryDaysOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-full bg-[#C95A1A] hover:bg-[#A94712] text-[#FAF7F1] text-xs font-semibold uppercase tracking-wider transition-all duration-200 shadow-lg flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <span>{language === 'am' ? 'ትእዛዝዎ በመካሄድ ላይ ነው...' : 'Processing Order...'}</span>
              ) : (
                <>
                  <span>{t('modal.placeOrder')} ({formatCurrency(totalAmount)})</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

          </form>
        )}

      </div>
    </div>
  );
};

