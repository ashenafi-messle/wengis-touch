import React, { useState } from 'react';
import { CartItem, Order, OrderItem } from '../types';
import { X, CheckCircle, Truck, CreditCard, ShieldCheck, ShoppingCart, ArrowRight, MessageCircle, ExternalLink, ShoppingBag } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { formatCurrency } from '../utils/currency';
import { getThumbnailImageUrl } from '../utils/imageOptimizer';

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
  const [shippingAddress, setShippingAddress] = useState('');
  const [deliveryPreference, setDeliveryPreference] = useState(language === 'am' ? '3 ቀን' : '3 Days');
  const [specialNotes, setSpecialNotes] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [submittedOrder, setSubmittedOrder] = useState<any | null>(null);
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
      productImage: ci.product.images[0] || '',
      color: ci.selectedColor,
      quantity: ci.quantity,
      price: ci.product.price
    }));

    const orderPayload = {
      customerName: customerName.trim(),
      customerEmail: `${customerName.trim().toLowerCase().replace(/\s+/g, '') || 'customer'}@order.com`,
      customerPhone: customerPhone.trim(),
      shippingAddress: shippingAddress.trim() || `Phone Contact: ${customerPhone.trim()}`,
      items: formattedItems,
      totalAmount,
      deliveryPreference,
      paymentMethod: 'Cash on Delivery / Mobile Transfer',
      specialNotes: specialNotes.trim()
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
        // Automatically attempt to open the Telegram Bot deep-link with the secure token
        if (data.telegramDeepLink) {
          try {
            window.open(data.telegramDeepLink, '_blank');
          } catch (e) {
            // Popup blocker might block window.open, button is prominently available
          }
        }
      } else {
        setErrorMessage(data.error || data.message || (language === 'am' ? 'ትእዛዙን ማስገባት አልተቻለም። እባክዎ እንደገና ይሞክሩ።' : 'Failed to place order. Please review your cart and try again.'));
      }
    } catch (err) {
      setErrorMessage(language === 'am' ? 'ከሰርቨር ጋር መገናኘት አልተቻለም። እባክዎ ኢንተርኔትዎን ያረጋግጡ።' : 'Error connecting to server. Please check your network.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F2747]/85 backdrop-blur-md overflow-y-auto">
      <div className="bg-[#FAF7F1] w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl border border-[#C95A1A]/30 relative animate-fadeIn my-8 text-left">
        
        {/* Header */}
        <div className="bg-[#0F2747] px-6 py-5 flex items-center justify-between border-b border-[#C95A1A]/30">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-[#C95A1A] flex items-center justify-center text-[#FAF7F1]">
              <ShoppingCart className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif-luxury text-xl font-bold text-[#FAF7F1]">
                {submittedOrder 
                  ? (language === 'am' ? 'ትእዛዝዎ ተመዝግቧል!' : 'Order Saved in Database') 
                  : t('orderModal.title')}
              </h3>
              <p className="text-[11px] text-[#D8C3A5]">
                {submittedOrder 
                  ? (language === 'am' ? 'የቴሌግራም ማረጋገጫ በመጠባበቅ ላይ' : 'Telegram Confirmation Pending') 
                  : (language === 'am' ? 'የእጅ ጥበብ ትእዛዝ' : 'Bespoke Handcrafted Order')}
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
          <div className="p-6 sm:p-8 text-center space-y-6">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto text-amber-700 shadow-md">
              <CheckCircle className="w-10 h-10" />
            </div>

            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-[#C95A1A]">
                {language === 'am' ? 'የትእዛዝ መለያ ቁጥር' : 'Order Reference'}
              </span>
              <h2 className="font-serif-luxury text-2xl sm:text-3xl font-bold text-[#0F2747] my-1">
                {submittedOrder.orderRef || submittedOrder.id}
              </h2>
              <div className="inline-flex items-center space-x-2 bg-amber-50 text-amber-900 border border-amber-300 px-3.5 py-1 rounded-full text-xs font-medium mt-2">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                <span>
                  {language === 'am' 
                    ? 'ትእዛዝዎ ተመዝግቧል • ለአድሚኑ ለመላክ ቦቱን ይክፈቱ' 
                    : 'Order Saved • Admin notification pending bot START'}
                </span>
              </div>
            </div>

            {/* Primary Action Card: Open Telegram Bot & Press START */}
            {submittedOrder.telegramDeepLink && (
              <div className="bg-[#142E52] p-5 sm:p-6 rounded-2xl border border-[#C95A1A]/40 text-[#FAF7F1] space-y-3.5 shadow-xl text-center">
                <div className="w-12 h-12 bg-[#229ED9]/20 text-[#229ED9] rounded-full flex items-center justify-center mx-auto border border-[#229ED9]/40">
                  <MessageCircle className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-serif-luxury text-base sm:text-lg font-bold text-[#FAF7F1]">
                    {language === 'am' ? 'ትእዛዝዎን በቴሌግራም ቦት ያረጋግጡ' : 'Confirm Order via Telegram Bot'}
                  </h4>
                  <p className="text-xs text-[#D8C3A5] max-w-md mx-auto mt-1 leading-relaxed">
                    {language === 'am'
                      ? 'ከታች ያለውን ቁልፍ በመጫን ቦቱን ይክፈቱ እና START የሚለውን ይጫኑ። ሙሉ የትእዛዝ መረጃዎ ወዲያውኑ ለወንጊስ ተች ይላካል!'
                      : 'Click below to open our Telegram Bot and press START. Your complete order details will be automatically sent to @wengi67!'}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-2.5">
                  <a
                    href={submittedOrder.telegramDeepLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center space-x-2 flex-1 py-3 px-4 rounded-full bg-[#229ED9] hover:bg-[#1C8AC2] text-white text-xs sm:text-sm font-bold uppercase tracking-wider transition-all duration-200 shadow-lg cursor-pointer transform hover:scale-[1.01]"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>{language === 'am' ? 'በቴሌግራም ክፈት' : 'Open in Telegram'}</span>
                    <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                  </a>

                  {submittedOrder.telegramAppDeepLink && (
                    <a
                      href={submittedOrder.telegramAppDeepLink}
                      className="inline-flex items-center justify-center space-x-2 flex-1 py-3 px-4 rounded-full bg-[#FAF7F1]/10 hover:bg-[#FAF7F1]/20 border border-[#FAF7F1]/30 text-[#FAF7F1] text-xs sm:text-sm font-semibold uppercase tracking-wider transition-all duration-200 cursor-pointer"
                    >
                      <ExternalLink className="w-4 h-4 text-[#229ED9]" />
                      <span>{language === 'am' ? 'በቴሌግራም አፕ ይክፈቱ' : 'Open in Telegram App'}</span>
                    </a>
                  )}
                </div>

                {/* Telegram Web Explanation Banner */}
                <div className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-600/30 text-[11px] text-[#D8C3A5] leading-relaxed text-left">
                  <span className="font-semibold text-amber-300 block mb-0.5">
                    {language === 'am' ? '💡 የቴሌግራም ዌብ (Telegram Web) መረጃ፡' : '💡 Note for Telegram Web users:'}
                  </span>
                  {language === 'am'
                    ? 'በብራውዘር ሲከፍቱ Telegram Web ቶከኑን ካላስተላለፈ "በቴሌግራም አፕ ይክፈቱ" የሚለውን ይጫኑ ወይም በድጋሚ ይሞክሩ። ትእዛዝዎ በሲስተሙ ውስጥ በሰላም ተቀምጧል።'
                    : 'Web browsers (Telegram Web) may sometimes fail to forward the order token. If the bot opens without confirming, use "Open in Telegram App" (Desktop/Mobile) or retry above. Your order is safely saved in our database!'}
                </div>

                <p className="text-[11px] text-[#D8C3A5]/80">
                  {language === 'am'
                    ? '🔒 ምንም መፃፍ ወይም መቅዳት አያስፈልግዎትም — START የሚለውን ብቻ ይጫኑ።'
                    : '🔒 No typing or copying required — simply press START when the bot opens.'}
                </p>
              </div>
            )}

            {/* Order Details Summary Box */}
            <div className="bg-[#F3E7D3] p-5 rounded-2xl border border-[#D8C3A5] text-left space-y-3">
              <div className="flex justify-between text-xs border-b border-black/10 pb-2 font-medium text-[#0F2747]">
                <span>{t('orderModal.customerName')}:</span>
                <span className="font-semibold">{submittedOrder.customerName}</span>
              </div>
              <div className="flex justify-between text-xs border-b border-black/10 pb-2 font-medium text-[#0F2747]">
                <span>{t('orderModal.customerPhone')}:</span>
                <span className="font-semibold">{submittedOrder.customerPhone}</span>
              </div>
              {submittedOrder.shippingAddress && (
                <div className="flex justify-between text-xs border-b border-black/10 pb-2 font-medium text-[#0F2747]">
                  <span>{language === 'am' ? 'አድራሻ / ከተማ፡' : 'Delivery Address:'}</span>
                  <span className="text-right max-w-[240px] truncate">{submittedOrder.shippingAddress}</span>
                </div>
              )}
              <div className="flex justify-between text-xs border-b border-black/10 pb-2 font-medium text-[#0F2747]">
                <span>{t('orderModal.deliveryOption')}:</span>
                <span>{submittedOrder.deliveryPreference}</span>
              </div>
              <div className="flex justify-between text-xs font-bold text-[#0F2747] pt-1">
                <span>{t('orderModal.totalAmount')}:</span>
                <span className="text-[#C95A1A] text-lg font-serif-luxury">{formatCurrency(submittedOrder.totalAmount)}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={onClose}
                className="w-full sm:w-auto px-8 py-3 rounded-full bg-[#0F2747] hover:bg-[#142E52] text-[#FAF7F1] text-xs font-semibold uppercase tracking-wider transition-colors shadow-md cursor-pointer flex items-center justify-center space-x-2"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>{language === 'am' ? 'ግዢዎን ይቀጥሉ' : 'Continue Shopping'}</span>
              </button>

              <a
                href="https://t.me/wengi67"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-6 py-3 rounded-full bg-[#FAF7F1] border border-[#0F2747]/20 hover:border-[#C95A1A] text-[#0F2747] text-xs font-semibold uppercase tracking-wider transition-colors flex items-center justify-center space-x-2 cursor-pointer"
              >
                <span>{language === 'am' ? 'ቀጥታ አነጋግሩን (@wengi67)' : 'Direct Chat @wengi67'}</span>
              </a>
            </div>
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
                      <img 
                        src={getThumbnailImageUrl(item.product.images[0])} 
                        alt={item.product.title} 
                        className="w-10 h-10 rounded-lg object-cover" 
                        referrerPolicy="no-referrer" 
                      />
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
                <span>{t('orderModal.totalAmount')}:</span>
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
                    {t('orderModal.nameLabel')} *
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
                    {t('orderModal.phoneLabel')} *
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-semibold text-[#0F2747] uppercase block mb-1">
                    {language === 'am' ? 'የመላኪያ አድራሻ / ከተማ' : 'Delivery Address / City'}
                  </label>
                  <input
                    type="text"
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    placeholder={language === 'am' ? 'ምሳሌ፡ አዲስ አበባ፣ ቦሌ' : 'e.g. Addis Ababa, Bole'}
                    className="w-full bg-[#FAF7F1] border border-[#D8C3A5] rounded-xl px-3.5 py-2.5 text-xs text-[#0F2747] focus:outline-none focus:border-[#C95A1A]"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-[#0F2747] uppercase block mb-1">
                    {t('orderModal.deliveryLabel')} *
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

              <div>
                <label className="text-[11px] font-semibold text-[#0F2747] uppercase block mb-1">
                  {language === 'am' ? 'ተጨማሪ ማስታወሻ (አማራጭ)' : 'Special Notes / Color Requests (Optional)'}
                </label>
                <input
                  type="text"
                  value={specialNotes}
                  onChange={(e) => setSpecialNotes(e.target.value)}
                  placeholder={language === 'am' ? 'የተለየ የክሮች ምርጫ ወይም ጥያቄ...' : 'Any custom sizing or yarn preferences...'}
                  className="w-full bg-[#FAF7F1] border border-[#D8C3A5] rounded-xl px-3.5 py-2.5 text-xs text-[#0F2747] focus:outline-none focus:border-[#C95A1A]"
                />
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
                  <span>{t('orderModal.placeOrder')} ({formatCurrency(totalAmount)})</span>
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
