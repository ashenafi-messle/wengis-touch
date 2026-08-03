import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, ArrowRight, Eye, ShieldCheck, Heart, RefreshCw, Layers } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { formatCurrency } from '../utils/currency';
import { Product } from '../types';

interface HeroSectionProps {
  onExploreClick: () => void;
  onCustomRequestClick: () => void;
  products: Product[];
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onExploreClick,
  onCustomRequestClick,
  products
}) => {
  const { t } = useLanguage();
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [currentIndex, setCurrentIndex] = useState(0);

  // Get first 4 products from database, or use fallback if not available
  const SHOWCASE_PRODUCTS = products.slice(0, 4).map((product, index) => ({
    id: product.id,
    title: product.title,
    category: product.category,
    image: product.images[0] || '/src/assets/images/wengi_hero_crochet_1785323531326.jpg',
    price: product.price,
    craftTime: '24h',
    desc: product.description,
    roundTag: 'New Arrival'
  }));

  // Auto 360-degree rotation timer cycling through products upon page load
  useEffect(() => {
    if (SHOWCASE_PRODUCTS.length === 0) return;
    
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % SHOWCASE_PRODUCTS.length);
    }, 4200);

    return () => clearInterval(timer);
  }, [SHOWCASE_PRODUCTS.length]);


  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      const x = (e.clientX / innerWidth - 0.5) * 20;
      const y = (e.clientY / innerHeight - 0.5) * 20;
      setMousePos({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const currentProduct = SHOWCASE_PRODUCTS[currentIndex];

  return (
    <section className="relative min-h-[60vh] sm:min-h-[80vh] bg-[#0F2747] overflow-hidden flex items-center justify-center py-4 sm:py-12 px-3 sm:px-6 lg:px-8 border-b border-[#C95A1A]/20">
      
      {/* Dynamic Animated Floating Yarn Path Lines Background */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none opacity-20"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M -100 200 C 300 100, 600 500, 1200 100 C 1500 -100, 1800 400, 2200 200"
          fill="none"
          stroke="#C95A1A"
          strokeWidth="3"
          strokeDasharray="12 8"
          className="animate-pulse"
        />
        <path
          d="M -50 450 C 400 600, 800 200, 1300 550 C 1700 700, 2000 300, 2300 600"
          fill="none"
          stroke="#D8C3A5"
          strokeWidth="2"
          strokeDasharray="8 6"
        />
      </svg>

      {/* Decorative Warm Ambient Glow Orbs */}
      <div className="absolute top-1/4 left-10 w-96 h-96 bg-[#C95A1A]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-[#D8C3A5]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-12 items-center relative z-10">
        
        {/* Left Editorial Copy Column */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="lg:col-span-6 space-y-3 sm:space-y-6 text-left relative"
        >
          {/* Background Watermark */}
          <div className="absolute -left-12 top-10 opacity-5 rotate-90 pointer-events-none select-none hidden sm:block">
            <span className="text-8xl font-serif uppercase tracking-widest text-[#FAF7F1]">HANDMADE</span>
          </div>

          {/* Eyebrow Tag */}
          <span className="text-[#C95A1A] uppercase tracking-[0.15em] sm:tracking-[0.25em] text-[9px] sm:text-[11px] font-bold flex items-center">
            <span className="w-4 sm:w-8 h-[1px] bg-[#C95A1A] mr-1.5 sm:mr-3"></span>
            {t('hero.badge')}
          </span>

          <h1 className="font-serif-luxury text-xl sm:text-4xl lg:text-6xl text-[#FAF7F1] font-bold leading-[1.1] sm:leading-[1.15] tracking-tight">
            {t('hero.title')}
          </h1>

          <p className="text-[#D8C3A5] text-[11px] sm:text-base leading-relaxed max-w-xl font-light line-clamp-2 sm:line-clamp-none">
            {t('hero.description')}
          </p>

          {/* Key Brand Highlights */}
          <div className="grid grid-cols-2 gap-1.5 sm:gap-4 py-1.5 sm:py-3 border-y border-[#FAF7F1]/10 text-left">
            <div>
              <span className="font-serif-luxury text-sm sm:text-xl font-bold text-[#FAF7F1] block">{t('hero.handcrafted')}</span>
              <span className="text-[8px] sm:text-[11px] text-[#D8C3A5] tracking-wider uppercase block truncate">Organic Cotton</span>
            </div>
            <div>
              <span className="font-serif-luxury text-sm sm:text-xl font-bold text-[#FAF7F1] block">{t('hero.masterArtisan')}</span>
              <span className="text-[8px] sm:text-[11px] text-[#D8C3A5] tracking-wider uppercase block truncate">Dessie, Ethiopia</span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-row items-center gap-2 pt-1 sm:pt-2">
            <button
              onClick={onExploreClick}
              className="flex-1 sm:flex-none px-3 py-2 sm:px-8 sm:py-4 rounded-full bg-[#C95A1A] hover:bg-[#A94712] text-[#FAF7F1] font-semibold text-[10px] sm:text-xs tracking-wider uppercase transition-all duration-300 shadow-lg hover:shadow-[#C95A1A]/30 flex items-center justify-center space-x-1.5 group cursor-pointer"
            >
              <span className="truncate">{t('hero.exploreBtn')}</span>
              <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 group-hover:translate-x-1 transition-transform shrink-0" />
            </button>

            <button
              onClick={onCustomRequestClick}
              className="flex-1 sm:flex-none px-3 py-2 sm:px-8 sm:py-4 rounded-full bg-transparent border-2 border-[#C95A1A] text-[#FAF7F1] hover:bg-[#C95A1A]/10 font-semibold text-[10px] sm:text-xs tracking-wider uppercase transition-all duration-300 flex items-center justify-center space-x-1.5 cursor-pointer"
            >
              <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#C95A1A] shrink-0" />
              <span className="truncate">{t('hero.customRequestBtn')}</span>
            </button>
          </div>

        </motion.div>

        {/* Right 3D Interactive & Rotating Motion Stage */}
        <div className="lg:col-span-6 relative min-h-[200px] sm:min-h-[550px] flex flex-col items-center justify-center perspective-[1200px]">
          
          {/* Round Indicator Badge */}
          {currentProduct && (
            <div className="absolute top-0 z-30 flex items-center space-x-2 px-3 py-1 sm:px-4 sm:py-1.5 rounded-full bg-[#142E52]/90 border border-[#C95A1A]/40 text-[#D8C3A5] text-[10px] sm:text-[11px] font-bold uppercase tracking-widest shadow-lg">
              <RefreshCw className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#C95A1A] animate-spin [animation-duration:6s]" />
              <span>{currentProduct.roundTag}</span>
            </div>
          )}

          {/* 360-Degree Rotating Hero Frame */}
          <AnimatePresence mode="wait">
            {currentProduct && (
              <motion.div
                key={currentProduct.id}
                initial={{ rotateY: 0, scale: 0.8, opacity: 0 }}
                animate={{ rotateY: 360, scale: 1, opacity: 1 }}
                exit={{ rotateY: 720, scale: 0.8, opacity: 0 }}
                transition={{ duration: 1.1, ease: [0.25, 1, 0.5, 1] }}
                style={{
                  x: mousePos.x * 0.6,
                  y: mousePos.y * 0.6,
                }}
                className="relative z-20 w-full max-w-[280px] sm:max-w-md aspect-[16/10] sm:aspect-[4/5] rounded-2xl sm:rounded-3xl overflow-hidden shadow-[0_15px_40px_-10px_rgba(201,90,26,0.35)] border-2 border-[#C95A1A]/50 bg-[#142E52] group mt-6 sm:mt-8"
              >
                <img
                  src={currentProduct.image}
                  alt={currentProduct.title}
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
                
                {/* Overlay Info */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0F2747] via-transparent to-transparent opacity-80" />
                
                <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-5">
                  <div className="flex items-center justify-between mb-1 sm:mb-2">
                    <span className="text-[9px] sm:text-[11px] uppercase font-bold tracking-widest text-[#C95A1A]">
                      {currentProduct.category}
                    </span>
                    <div className="flex items-center space-x-1">
                      <Layers className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[#D8C3A5]" />
                      <span className="text-[9px] sm:text-[11px] text-[#D8C3A5] font-medium">
                        {currentProduct.craftTime}
                      </span>
                    </div>
                  </div>
                  
                  <h3 className="font-serif-luxury text-sm sm:text-xl font-bold text-[#FAF7F1] mb-1 sm:mb-2 line-clamp-1">
                    {currentProduct.title}
                  </h3>
                  
                  <p className="text-[10px] sm:text-xs text-[#D8C3A5] line-clamp-2 mb-2 sm:mb-3 font-light">
                    {currentProduct.desc}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <span className="font-serif-luxury text-base sm:text-2xl font-bold text-[#C95A1A]">
                      {formatCurrency(currentProduct.price)}
                    </span>
                    <div className="flex items-center space-x-1 text-[#FAF7F1]/80 text-[10px] sm:text-xs">
                      <Eye className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                      <span>Quick View</span>
                    </div>
                  </div>
                </div>

                {/* Floating Action Badges */}
                <div className="absolute top-2 sm:top-3 right-2 sm:right-3 flex flex-col space-y-1.5 sm:space-y-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#FAF7F1] text-[#0F2747] flex items-center justify-center shadow-lg hover:bg-[#C95A1A] hover:text-[#FAF7F1] transition-colors cursor-pointer">
                    <Heart className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  </button>
                  <button className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#FAF7F1] text-[#0F2747] flex items-center justify-center shadow-lg hover:bg-[#C95A1A] hover:text-[#FAF7F1] transition-colors cursor-pointer">
                    <ShieldCheck className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Round Progress Indicator Dots */}
          <div className="flex items-center space-x-1.5 pt-1.5 sm:pt-3">
            {SHOWCASE_PRODUCTS.map((item, idx) => (
              <button
                key={item.id}
                onClick={() => setCurrentIndex(idx)}
                className={`h-1 sm:h-1.5 rounded-full transition-all duration-500 cursor-pointer ${
                  idx === currentIndex ? 'w-6 sm:w-8 bg-[#C95A1A]' : 'w-2 bg-[#FAF7F1]/30 hover:bg-[#FAF7F1]/60'
                }`}
                title={item.title}
              />
            ))}
          </div>

          {/* Layered Floating Accent Card 1 (Top Right) */}
          {SHOWCASE_PRODUCTS.length > 1 && (
            <motion.div
              style={{
                x: mousePos.x * -1.2,
                y: mousePos.y * -1.2,
              }}
              transition={{ type: 'spring', stiffness: 80, damping: 15 }}
              className="absolute top-8 -right-2 sm:-right-6 z-30 w-44 sm:w-52 p-3 bg-[#142E52]/90 backdrop-blur-md rounded-xl border border-[#C95A1A]/30 shadow-2xl animate-float-slow hidden sm:block"
            >
              <div className="flex items-center space-x-3">
                <img
                  src={SHOWCASE_PRODUCTS[1]?.image}
                  alt={SHOWCASE_PRODUCTS[1]?.title}
                  className="w-12 h-12 rounded-lg object-cover border border-[#C95A1A]/30"
                  referrerPolicy="no-referrer"
                />
                <div className="text-left">
                  <span className="text-[10px] uppercase text-[#C95A1A] font-bold block">Round 1</span>
                  <p className="text-xs font-semibold text-[#FAF7F1] truncate">{SHOWCASE_PRODUCTS[1]?.title}</p>
                  <p className="text-[11px] text-[#D8C3A5] font-serif-luxury">{formatCurrency(SHOWCASE_PRODUCTS[1]?.price || 0)}</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Layered Floating Accent Card 2 (Bottom Left) */}
          {SHOWCASE_PRODUCTS.length > 2 && (
            <motion.div
              style={{
                x: mousePos.x * 1.5,
                y: mousePos.y * 1.5,
              }}
              transition={{ type: 'spring', stiffness: 90, damping: 18 }}
              className="absolute bottom-4 -left-2 sm:-left-8 z-30 w-48 sm:w-56 p-3 bg-[#142E52]/90 backdrop-blur-md rounded-xl border border-[#C95A1A]/30 shadow-2xl animate-float-reverse hidden sm:block"
            >
              <div className="flex items-center space-x-3">
                <img
                  src={SHOWCASE_PRODUCTS[2]?.image}
                  alt={SHOWCASE_PRODUCTS[2]?.title}
                  className="w-12 h-14 rounded-lg object-cover border border-[#C95A1A]/30"
                  referrerPolicy="no-referrer"
                />
                <div className="text-left">
                  <div className="flex items-center space-x-1 text-[#C95A1A]">
                    <ShieldCheck className="w-3 h-3" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Round 2</span>
                  </div>
                  <p className="text-xs font-semibold text-[#FAF7F1] truncate">{SHOWCASE_PRODUCTS[2]?.title}</p>
                  <p className="text-[11px] text-[#D8C3A5] font-serif-luxury">{formatCurrency(SHOWCASE_PRODUCTS[2]?.price || 0)}</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Decorative Floating Golden Yarn Badge */}
          <div className="absolute top-1/2 -left-12 z-10 w-24 h-24 rounded-full border border-[#D8C3A5]/20 bg-[#0F2747]/80 backdrop-blur-sm flex items-center justify-center p-2 animate-spin [animation-duration:20s] hidden md:flex">
            <span className="text-[9px] uppercase tracking-widest text-[#D8C3A5] text-center font-semibold">
              Wengi's Touch • Bespoke • Artisanal •
            </span>
          </div>

        </div>

      </div>
    </section>
  );
};