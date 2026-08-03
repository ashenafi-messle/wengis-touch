import React, { useState } from 'react';
import { Product } from '../types';
import { Sparkles, Eye, Clock, Check, Filter, Layers, ShoppingCart } from 'lucide-react';
import { useLanguage, getProductTranslation } from '../context/LanguageContext';
import { formatCurrency } from '../utils/currency';

interface ProductShowcaseProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
  onAddToCart: (product: Product, selectedColor: string) => void;
  searchQuery: string;
}

export const ProductShowcase: React.FC<ProductShowcaseProps> = ({
  products,
  onSelectProduct,
  onAddToCart,
  searchQuery
}) => {
  const { language, t } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'featured' | 'price-low' | 'price-high'>('featured');
  const [selectedColors, setSelectedColors] = useState<Record<string, string>>({});

  // Extract unique categories from products dynamically
  const categories = React.useMemo(() => {
    const uniqueCategories = new Set(products.map(p => p.category));
    return ['All', ...Array.from(uniqueCategories).sort()];
  }, [products]);

  const getCategoryLabel = (cat: string) => {
    if (cat === 'All') return t('showcase.cat.all');
    // For dynamic categories, just return the category name as-is
    return cat;
  };

  // Filter products based on search, category, availability
  const filteredProducts = products.filter(product => {
    const translated = getProductTranslation(product.title, product.category, language);
    const matchesSearch = searchQuery === '' || 
      product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      translated.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    const matchesStock = !inStockOnly || product.available;

    return matchesSearch && matchesCategory && matchesStock;
  }).sort((a, b) => {
    if (sortBy === 'price-low') return a.price - b.price;
    if (sortBy === 'price-high') return b.price - a.price;
    return 0;
  });

  return (
    <section id="collection-showcase" className="py-4 sm:py-16 px-3 sm:px-6 lg:px-8 max-w-7xl mx-auto">

      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-3 sm:mb-10 pb-2 sm:pb-6 border-b border-[#0F2747]/10">
        <div>
          <span className="text-[9px] sm:text-xs uppercase tracking-[0.15em] sm:tracking-[0.25em] text-[#C95A1A] font-bold block mb-1 sm:mb-2">
            {t('showcase.subtitle')}
          </span>
          <h2 className="font-serif-luxury text-xl sm:text-4xl font-bold text-[#0F2747]">
            {t('showcase.title')}
          </h2>
        </div>

        <p className="text-[11px] sm:text-sm text-[#1E1E1E]/70 max-w-md mt-1 md:mt-0 font-light line-clamp-2 sm:line-clamp-none">
          {t('showcase.desc')}
        </p>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-2 sm:gap-3 mb-4 sm:mb-6 bg-[#F3E7D3] p-2 sm:p-4 rounded-xl sm:rounded-2xl border border-[#D8C3A5]">

        {/* Category Pills (Horizontal Scroll on Mobile) */}
        <div className="flex flex-nowrap overflow-x-auto gap-1 sm:gap-2 w-full lg:w-auto no-scrollbar pb-0.5">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2 py-1 sm:px-4 sm:py-2 rounded-full text-[10px] sm:text-xs font-semibold uppercase tracking-wider transition-all duration-200 cursor-pointer shrink-0 ${
                selectedCategory === cat
                  ? 'bg-[#0F2747] text-[#FAF7F1] shadow-md'
                  : 'bg-[#FAF7F1]/80 text-[#0F2747] hover:bg-[#FAF7F1] hover:text-[#C95A1A]'
              }`}
            >
              {getCategoryLabel(cat)}
            </button>
          ))}
        </div>

        {/* Secondary Sorting & Availability Controls */}
        <div className="flex items-center space-x-2 sm:space-x-3 w-full lg:w-auto justify-between lg:justify-end text-[10px] sm:text-xs">

          {/* In Stock Toggle */}
          <label className="flex items-center space-x-1 text-[10px] sm:text-xs font-medium text-[#0F2747] cursor-pointer">
            <input
              type="checkbox"
              checked={inStockOnly}
              onChange={(e) => setInStockOnly(e.target.checked)}
              className="rounded border-[#C95A1A] text-[#C95A1A] focus:ring-[#C95A1A] w-3 h-3 sm:w-4 sm:h-4"
            />
            <span className="text-[10px] sm:text-xs">{language === 'am' ? 'አሁን የሚገኙ' : 'Available Now'}</span>
          </label>

          {/* Sort Dropdown */}
          <div className="flex items-center space-x-1">
            <Filter className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#C95A1A] shrink-0" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-[#FAF7F1] text-[10px] sm:text-xs text-[#0F2747] border border-[#D8C3A5] rounded-lg sm:rounded-xl px-2 py-0.5 sm:px-3 sm:py-1.5 focus:outline-none focus:border-[#C95A1A]"
            >
              <option value="featured">{language === 'am' ? 'ቅደም ተከተል፡ ልዩ ስራዎች' : 'Sort: Featured First'}</option>
              <option value="price-low">{language === 'am' ? 'ዋጋ፡ ከዝቅተኛ ወደ ከፍተኛ' : 'Price: Low to High'}</option>
              <option value="price-high">{language === 'am' ? 'ዋጋ፡ ከከፍተኛ ወደ ዝቅተኛ' : 'Price: High to Low'}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Product Grid - 2 columns on mobile for high density & less vertical scroll */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-8 sm:py-20 bg-[#F3E7D3]/40 rounded-2xl sm:rounded-3xl border border-[#D8C3A5]/50">
          <Layers className="w-8 h-8 sm:w-12 sm:h-12 text-[#C95A1A] mx-auto mb-2 opacity-60" />
          <h3 className="font-serif-luxury text-base sm:text-xl font-bold text-[#0F2747]">{t('showcase.empty')}</h3>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-8">
          {filteredProducts.map((product, idx) => {
            const translated = getProductTranslation(product.title, product.category, language);

            return (
              <div
                key={product.id}
                className="rounded-lg sm:rounded-2xl overflow-hidden transition-all duration-300 transform hover:-translate-y-1 shadow-md sm:shadow-lg group flex flex-col justify-between bg-[#142E52] border border-[#C95A1A]/30 text-[#FAF7F1]"
              >
                {/* Image Container */}
                <div className="relative aspect-[4/3] overflow-hidden cursor-pointer" onClick={() => onSelectProduct(product)}>
                  <img
                    src={product.images[0] || 'https://picsum.photos/seed/crochet/600/450'}
                    alt={translated.title}
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />

                  {/* Hover Quick Action */}
                  <div className="absolute inset-0 bg-[#0F2747]/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectProduct(product);
                      }}
                      className="px-2 py-1 sm:px-3 sm:py-1.5 rounded-full bg-[#FAF7F1] text-[#0F2747] text-[9px] sm:text-xs font-semibold flex items-center space-x-1 shadow-md hover:bg-[#C95A1A] hover:text-[#FAF7F1] transition-colors"
                    >
                      <Eye className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                      <span className="hidden sm:inline">{t('showcase.viewDetails')}</span>
                    </button>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-2 sm:p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-[8px] sm:text-[10px] uppercase font-bold tracking-widest text-[#C95A1A]">
                        {translated.category}
                      </span>
                      <div className="flex items-center space-x-2">
                        <div 
                          className="w-3 h-3 sm:w-4 sm:h-4 rounded-full border-2 border-white/40"
                          style={{ backgroundColor: selectedColors[product.id] || '#0F2747' }}
                        />
                        <select
                          value={selectedColors[product.id] || ''}
                          onChange={(e) => {
                            setSelectedColors(prev => ({
                              ...prev,
                              [product.id]: e.target.value
                            }));
                          }}
                          onClick={(e) => e.stopPropagation()}
                          className="bg-[#142E52] text-[9px] sm:text-[11px] text-[#FAF7F1] border border-[#C95A1A]/40 rounded-lg px-2 py-1 focus:outline-none focus:border-[#C95A1A] cursor-pointer"
                        >
                          {typeof product.colors === 'string' 
                            ? product.colors.split(',').map((col, i) => (
                                <option key={i} value={col.trim()}>
                                  {col.trim()}
                                </option>
                              ))
                            : Array.isArray(product.colors) 
                              ? product.colors.map((col: any, i: number) => (
                                  <option key={i} value={col.name || col}>
                                    {col.name || col}
                                  </option>
                                ))
                              : <option value="">No colors</option>
                          }
                        </select>
                      </div>
                    </div>

                    <h3
                      onClick={() => onSelectProduct(product)}
                      className="font-serif-luxury text-[11px] sm:text-xl font-bold cursor-pointer transition-colors line-clamp-1 hover:text-[#C95A1A]"
                    >
                      {translated.title}
                    </h3>

                    <p className="text-[9px] sm:text-xs mt-0.5 sm:mt-2 line-clamp-1 sm:line-clamp-2 font-light text-[#D8C3A5]">
                      {product.description}
                    </p>
                  </div>

                  {/* Price & Action Row */}
                  <div className="mt-2 sm:mt-6 pt-1.5 sm:pt-4 border-t border-white/10 flex items-center justify-between gap-1">
                    <div>
                      <div className="flex items-baseline space-x-1 sm:space-x-2">
                        <span className="font-serif-luxury text-sm sm:text-2xl font-bold text-[#FAF7F1]">
                          {formatCurrency(product.price)}
                        </span>
                      </div>
                      <span className="text-[7px] sm:text-[10px] text-emerald-400 font-semibold block truncate">
                        {product.available ? (language === 'am' ? 'ዝግጁ' : 'In Stock') : t('showcase.madeToOrder')}
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        const colorText = typeof product.colors === 'string' 
                          ? product.colors.split(',')[0]?.trim() || ''
                          : Array.isArray(product.colors) 
                            ? product.colors[0]?.name || ''
                            : '';
                        onAddToCart(product, selectedColors[product.id] || colorText);
                      }}
                      className="px-2 py-1 sm:px-4 sm:py-2.5 rounded-full bg-[#C95A1A] hover:bg-[#A94712] text-[#FAF7F1] text-[9px] sm:text-xs font-semibold tracking-wider uppercase transition-colors shadow-md flex items-center space-x-1 cursor-pointer shrink-0"
                    >
                      <ShoppingCart className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5" />
                      <span className="hidden sm:inline">{t('showcase.order')}</span>
                      <span className="inline sm:hidden">+</span>
                    </button>
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );

};

