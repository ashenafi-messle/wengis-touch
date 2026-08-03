import React, { useState } from 'react';
import { Product } from '../types';
import { X, ShoppingCart, ShieldCheck, Sparkles, Check, ArrowRight, Heart } from 'lucide-react';
import { useLanguage, getProductTranslation } from '../context/LanguageContext';
import { formatCurrency } from '../utils/currency';

interface ProductDetailsModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCartWithSpecs: (product: Product, selectedColor: string, quantity: number) => void;
  onDirectOrderNow: (product: Product, selectedColor: string, quantity: number) => void;
}

export const ProductDetailsModal: React.FC<ProductDetailsModalProps> = ({
  product,
  onClose,
  onAddToCartWithSpecs,
  onDirectOrderNow
}) => {
  if (!product) return null;

  const { language, t } = useLanguage();
  const translated = getProductTranslation(product.title, product.category, language);

  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  const [selectedColor, setSelectedColor] = useState<string>(() => {
    if (typeof product.colors === 'string') {
      return product.colors.split(',')[0]?.trim() || '';
    } else if (Array.isArray(product.colors)) {
      return product.colors[0]?.name || '';
    }
    return '';
  });
  const [quantity, setQuantity] = useState<number>(1);
  const [addedNotice, setAddedNotice] = useState<boolean>(false);

  const handleAdd = () => {
    onAddToCartWithSpecs(product, selectedColor, quantity);
    setAddedNotice(true);
    setTimeout(() => setAddedNotice(false), 2000);
  };

  const handleOrder = () => {
    onDirectOrderNow(product, selectedColor, quantity);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F2747]/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-[#FAF7F1] w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl border border-[#C95A1A]/30 relative animate-fadeIn my-8">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-[#0F2747] text-[#FAF7F1] flex items-center justify-center hover:bg-[#C95A1A] transition-colors cursor-pointer shadow-md"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-0">
          
          {/* Left Column: Images Gallery */}
          <div className="md:col-span-6 bg-[#0F2747] p-6 flex flex-col justify-between">
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-[#C95A1A]/30 mb-4 shadow-lg">
              <img
                src={product.images[activeImageIndex] || product.images[0]}
                alt={translated.title}
                className="w-full h-full object-cover transition-all duration-300"
                referrerPolicy="no-referrer"
              />
              <span className="absolute top-3 left-3 bg-[#C95A1A] text-[#FAF7F1] text-[10px] uppercase font-bold tracking-widest px-3 py-1 rounded-full">
                {translated.category}
              </span>
            </div>

            {/* Thumbnail Navigation */}
            {product.images.length > 1 && (
              <div className="flex space-x-3 overflow-x-auto pb-2">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                      activeImageIndex === idx ? 'border-[#C95A1A] scale-105' : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="Thumbnail" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </button>
                ))}
              </div>
            )}

            {/* Craftsmanship Highlights Box */}
            <div className="mt-4 p-4 rounded-2xl bg-[#142E52] border border-[#C95A1A]/20 text-left">
              <div className="flex items-center space-x-2 text-[#C95A1A] text-xs font-bold uppercase tracking-wider mb-2">
                <Sparkles className="w-4 h-4" />
                <span>{language === 'am' ? 'የአቴሊየር የእጅ ጥበብ' : 'Atelier Craftsmanship'}</span>
              </div>
              <ul className="text-xs text-[#D8C3A5] space-y-1.5 font-light">
                <li className="flex items-center space-x-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#C95A1A]" />
                  <span>{language === 'am' ? 'ብቃት ተማርከው የተሰራ' : 'Handcrafted with skill and care'}</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Right Column: Product Specs & Direct Checkout Form */}
          <div className="md:col-span-6 p-6 sm:p-8 flex flex-col justify-between text-left">
            <div>
              <span className="text-xs uppercase tracking-widest text-[#C95A1A] font-bold block mb-1">
                Wengi's Touch Exclusive
              </span>

              <h2 className="font-serif-luxury text-2xl sm:text-3xl font-bold text-[#0F2747]">
                {translated.title}
              </h2>

              <div className="flex items-baseline space-x-3 my-3">
                <span className="font-serif-luxury text-3xl font-bold text-[#C95A1A]">
                  {formatCurrency(product.price)}
                </span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#F3E7D3] text-[#0F2747] font-semibold border border-[#D8C3A5]">
                  {language === 'am' ? 'ታክስ ተካቷል' : 'Taxes Included'}
                </span>
              </div>

              <p className="text-xs text-[#1E1E1E]/80 leading-relaxed font-light mb-6">
                {product.description}
              </p>

              {/* Color Selection */}
              <div className="mb-5">
                <label className="text-xs uppercase font-bold text-[#0F2747] tracking-wider block mb-2">
                  {language === 'am' ? 'የተመረጠ ቀለም፡' : 'Selected Color:'} <span className="text-[#C95A1A]">{selectedColor}</span>
                </label>
                <select
                  value={selectedColor}
                  onChange={(e) => setSelectedColor(e.target.value)}
                  className="w-full bg-[#F3E7D3] text-[#0F2747] border border-[#D8C3A5] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#C95A1A]"
                >
                  {typeof product.colors === 'string' 
                    ? product.colors.split(',').map((col, idx) => (
                        <option key={idx} value={col.trim()}>
                          {col.trim()}
                        </option>
                      ))
                    : Array.isArray(product.colors) 
                      ? product.colors.map((col: any, idx: number) => (
                          <option key={idx} value={col.name || col}>
                            {col.name || col}
                          </option>
                        ))
                      : <option value="">No colors</option>
                  }
                </select>
              </div>

              {/* Quantity Controller */}
              <div className="mb-6">
                <label className="text-xs uppercase font-bold text-[#0F2747] tracking-wider block mb-2">
                  {language === 'am' ? 'ብዛት፡' : 'Quantity:'}
                </label>
                <div className="flex items-center space-x-3">
                  <div className="flex items-center border border-[#D8C3A5] rounded-xl bg-[#F3E7D3] overflow-hidden">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-3 py-1.5 text-[#0F2747] font-bold hover:bg-[#D8C3A5] transition-colors"
                    >
                      -
                    </button>
                    <span className="px-4 text-xs font-bold text-[#0F2747]">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="px-3 py-1.5 text-[#0F2747] font-bold hover:bg-[#D8C3A5] transition-colors"
                    >
                      +
                    </button>
                  </div>
                  <span className="text-[11px] text-[#0F2747]/70 font-light">
                    {language === 'am' ? 'ድምር፡' : 'Total:'} <strong className="text-[#C95A1A]">{formatCurrency(product.price * quantity)}</strong>
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-4 border-t border-[#0F2747]/10">
              {addedNotice && (
                <div className="p-2.5 bg-emerald-100 text-emerald-800 text-xs rounded-xl flex items-center justify-center space-x-2 animate-bounce">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>{language === 'am' ? 'ወደ ትእዛዝ ዝርዝርዎ ተጨምሯል!' : 'Added to your order list!'}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleAdd}
                  className="w-full py-3.5 rounded-full bg-[#0F2747] hover:bg-[#142E52] text-[#FAF7F1] text-xs font-semibold uppercase tracking-wider transition-colors flex items-center justify-center space-x-2 shadow-md cursor-pointer"
                >
                  <ShoppingCart className="w-4 h-4 text-[#C95A1A]" />
                  <span>{t('showcase.order')}</span>
                </button>

                <button
                  onClick={handleOrder}
                  className="w-full py-3.5 rounded-full bg-[#C95A1A] hover:bg-[#A94712] text-[#FAF7F1] text-xs font-semibold uppercase tracking-wider transition-colors flex items-center justify-center space-x-2 shadow-md cursor-pointer"
                >
                  <span>{t('modal.orderNow')}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

