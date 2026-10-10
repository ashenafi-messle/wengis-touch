import React from 'react';
import { CartItem } from '../types';
import { X, Trash2, ShoppingCart, ArrowRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { formatCurrency } from '../utils/currency';
import { getThumbnailImageUrl } from '../utils/imageOptimizer';
import { BackButton } from './BackButton';
import { OptimizedImage } from './OptimizedImage';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onUpdateQuantity: (index: number, newQty: number) => void;
  onRemoveItem: (index: number) => void;
  onProceedToCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout
}) => {
  if (!isOpen) return null;

  const { language, t } = useLanguage();
  const total = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-[#0F2747]/70 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md bg-[#FAF7F1] h-full shadow-2xl flex flex-col justify-between border-l border-[#C95A1A]/30 text-left">
        
        {/* Drawer Header */}
        <div className="bg-[#0F2747] p-4 sm:p-5 flex items-center justify-between text-[#FAF7F1] border-b border-[#C95A1A]/30">
          <div className="flex items-center space-x-2">
            <BackButton
              onClick={onClose}
              size="sm"
              variant="ghost"
              label={language === 'am' ? 'ተመለስ' : 'Back'}
            />
            <ShoppingCart className="w-5 h-5 text-[#C95A1A]" />
            <span className="font-serif-luxury text-base sm:text-lg font-bold">
              {language === 'am' ? `የጋሪዎ (${cart.length})` : `Your Cart (${cart.length})`}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-[#FAF7F1] hover:text-[#C95A1A] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {cart.length === 0 ? (
            <div className="text-center py-20 space-y-3">
              <ShoppingCart className="w-12 h-12 text-[#C95A1A]/40 mx-auto" />
              <p className="font-serif-luxury text-lg text-[#0F2747] font-bold">
                {language === 'am' ? 'የትእዛዝ ዝርዝርዎ ባዶ ነው' : 'Your order list is currently empty'}
              </p>
              <p className="text-xs text-[#1E1E1E]/60 max-w-xs mx-auto">
                {language === 'am' ? 'የእጅ የክሮሼት ስራዎቻችንን ይጎብኙ እና እቃዎችን ለማዘዝ ይዘዙ የሚለውን ይጫኑ።' : 'Explore our handcrafted crochet collection and click Order to add pieces.'}
              </p>
            </div>
          ) : (
            cart.map((item, idx) => (
              <div
                key={idx}
                className="bg-[#F3E7D3] p-3.5 rounded-2xl border border-[#D8C3A5] flex items-center space-x-3 relative shadow-sm"
              >
                <OptimizedImage
                  src={item.product.images[0]}
                  alt={item.product.title}
                  preset="thumbnail"
                  aspectRatio="1/1"
                  className="w-16 h-16 rounded-xl object-cover border border-[#C95A1A]/20"
                />

                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-[#0F2747] truncate">{item.product.title}</h4>
                  <div className="flex items-center space-x-2 mt-0.5">
                    <span className="text-[11px] text-[#C95A1A] font-medium">{item.selectedColor}</span>
                  </div>
                  <p className="font-serif-luxury text-sm font-bold text-[#0F2747] mt-1">
                    {formatCurrency(item.product.price)}
                  </p>

                  {/* Quantity Controls */}
                  <div className="flex items-center space-x-2 mt-2">
                    <button
                      onClick={() => onUpdateQuantity(idx, Math.max(1, item.quantity - 1))}
                      className="w-6 h-6 rounded-md bg-[#FAF7F1] text-[#0F2747] font-bold text-xs flex items-center justify-center border border-[#D8C3A5]"
                    >
                      -
                    </button>
                    <span className="text-xs font-bold text-[#0F2747]">{item.quantity}</span>
                    <button
                      onClick={() => onUpdateQuantity(idx, item.quantity + 1)}
                      className="w-6 h-6 rounded-md bg-[#FAF7F1] text-[#0F2747] font-bold text-xs flex items-center justify-center border border-[#D8C3A5]"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Remove Button */}
                <button
                  onClick={() => onRemoveItem(idx)}
                  className="p-1.5 text-gray-400 hover:text-red-600 transition-colors cursor-pointer"
                  title={language === 'am' ? 'እቃውን አስወግድ' : 'Remove item'}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Drawer Footer Checkout CTA */}
        {cart.length > 0 && (
          <div className="p-5 bg-[#F3E7D3] border-t border-[#D8C3A5] space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#0F2747]">
                {t('orderModal.totalAmount')}:
              </span>
              <span className="font-serif-luxury text-2xl font-bold text-[#C95A1A]">{formatCurrency(total)}</span>
            </div>

            <button
              onClick={() => {
                onClose();
                onProceedToCheckout();
              }}
              className="w-full py-4 rounded-full bg-[#C95A1A] hover:bg-[#A94712] text-[#FAF7F1] text-xs font-semibold uppercase tracking-wider transition-colors shadow-lg flex items-center justify-center space-x-2 cursor-pointer"
            >
              <span>{t('orderModal.placeOrder')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

