import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, Menu, X, Search, Sparkles, Globe, ShoppingCart } from 'lucide-react';
import { CartItem } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface NavbarProps {
  activeTab: 'home' | 'contact' | 'admin';
  setActiveTab: (tab: 'home' | 'contact' | 'admin') => void;
  cart: CartItem[];
  setIsCartOpen: (open: boolean) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  isLoggedIn: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  cart,
  setIsCartOpen,
  searchQuery,
  setSearchQuery,
  isLoggedIn
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { language, setLanguage, t } = useLanguage();

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <header className="sticky top-0 z-40 bg-[#0F2747]/95 backdrop-blur-md border-b border-[#C95A1A]/20 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Animated Brand Logo & Title */}
          <motion.div
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="flex items-center space-x-2 sm:space-x-3 cursor-pointer group select-none"
            onClick={() => setActiveTab('home')}
          >
            <motion.div
              animate={{
                rotate: [0, 8, -8, 0],
                scale: [1, 1.08, 1],
                boxShadow: [
                  "0 0 0px rgba(201,90,26,0)",
                  "0 0 16px rgba(201,90,26,0.5)",
                  "0 0 0px rgba(201,90,26,0)"
                ]
              }}
              transition={{ repeat: Infinity, duration: 4.5, ease: "easeInOut" }}
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#C95A1A] flex items-center justify-center text-[#FAF7F1] shadow-md border border-[#F3E7D3]/30 shrink-0"
            >
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 animate-pulse text-[#FAF7F1]" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="flex flex-col text-left"
            >
              <motion.span
                animate={{ y: [0, -1.5, 0] }}
                transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
                className="font-serif-luxury text-base sm:text-2xl font-bold tracking-wider text-[#FAF7F1] block group-hover:text-[#C95A1A] transition-colors leading-tight"
              >
                Wengi's <span className="italic font-normal text-[#F3E7D3] group-hover:text-[#FAF7F1] transition-colors">Touch</span>
              </motion.span>
              <span className="text-[8px] sm:text-[10px] tracking-[0.22em] text-[#D8C3A5] uppercase block font-medium hidden sm:block">
                Haute Crochet Atelier
              </span>
            </motion.div>
          </motion.div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-6 lg:space-x-8">
            <button
              onClick={() => setActiveTab('home')}
              className={`text-sm font-medium tracking-wider transition-colors duration-200 uppercase py-1 relative cursor-pointer ${
                activeTab === 'home'
                  ? 'text-[#C95A1A] font-semibold'
                  : 'text-[#FAF7F1]/80 hover:text-[#C95A1A]'
              }`}
            >
              {t('nav.collection')}
              {activeTab === 'home' && (
                <motion.span 
                  layoutId="activeNavUnderline"
                  className="absolute bottom-0 left-0 w-full h-[2px] bg-[#C95A1A] rounded-full" 
                />
              )}
            </button>

            <button
              onClick={() => setActiveTab('contact')}
              className={`text-sm font-medium tracking-wider transition-colors duration-200 uppercase py-1 relative cursor-pointer ${
                activeTab === 'contact'
                  ? 'text-[#C95A1A] font-semibold'
                  : 'text-[#FAF7F1]/80 hover:text-[#C95A1A]'
              }`}
            >
              {t('nav.contact')}
              {activeTab === 'contact' && (
                <motion.span 
                  layoutId="activeNavUnderline"
                  className="absolute bottom-0 left-0 w-full h-[2px] bg-[#C95A1A] rounded-full" 
                />
              )}
            </button>

            <button
              onClick={() => setActiveTab('admin')}
              className={`text-xs px-3.5 py-1.5 rounded-full border border-[#C95A1A]/40 flex items-center space-x-1.5 transition-all duration-200 cursor-pointer ${
                activeTab === 'admin'
                  ? 'bg-[#C95A1A] text-[#FAF7F1]'
                  : 'text-[#D8C3A5] hover:border-[#C95A1A] hover:text-[#FAF7F1]'
              }`}
            >
              <Lock className="w-3.5 h-3.5 text-[#FAF7F1]" />
              <span>{isLoggedIn ? t('nav.adminDashboard') : t('nav.admin')}</span>
            </button>
          </nav>

          {/* Action Icons: Language Switcher, Search & Cart */}
          <div className="flex items-center space-x-1.5 sm:space-x-3">

            {/* Language Switcher Toggle Pill */}
            <div className="flex items-center bg-[#142E52] border border-[#C95A1A]/40 rounded-full p-0.5 sm:p-1 text-[10px] sm:text-xs">
              <button
                onClick={() => setLanguage('en')}
                className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full font-bold transition-all cursor-pointer flex items-center space-x-0.5 sm:space-x-1 ${
                  language === 'en'
                    ? 'bg-[#C95A1A] text-[#FAF7F1] shadow-sm'
                    : 'text-[#D8C3A5] hover:text-[#FAF7F1]'
                }`}
                title="English"
              >
                <span className="text-xs sm:text-sm">🇬🇧</span>
                <span className="text-[9px] sm:text-[11px]">EN</span>
              </button>
              <button
                onClick={() => setLanguage('am')}
                className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full font-bold transition-all cursor-pointer flex items-center space-x-0.5 sm:space-x-1 ${
                  language === 'am'
                    ? 'bg-[#C95A1A] text-[#FAF7F1] shadow-sm'
                    : 'text-[#D8C3A5] hover:text-[#FAF7F1]'
                }`}
                title="አማርኛ"
              >
                <span className="text-xs sm:text-sm">🇪🇹</span>
                <span className="text-[9px] sm:text-[11px]">AM</span>
              </button>
            </div>

            {/* Search Input Toggle */}
            <div className="relative">
              {searchOpen ? (
                <motion.div
                  initial={{ opacity: 0, width: 100 }}
                  animate={{ opacity: 1, width: "auto" }}
                  className="flex items-center bg-[#142E52] border border-[#C95A1A]/40 rounded-full px-2 py-1 sm:px-3 sm:py-1.5"
                >
                  <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#D8C3A5] shrink-0" />
                  <input
                    type="text"
                    placeholder={t('nav.searchPlaceholder')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-transparent border-none text-[10px] sm:text-xs text-[#FAF7F1] focus:outline-none px-1.5 sm:px-2 w-24 sm:w-40 placeholder-[#D8C3A5]/60"
                    autoFocus
                  />
                  <button onClick={() => setSearchOpen(false)} className="text-[#D8C3A5] hover:text-[#C95A1A] shrink-0 p-0.5 sm:p-1">
                    <X className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  </button>
                </motion.div>
              ) : (
                <button
                  onClick={() => setSearchOpen(true)}
                  className="p-1.5 sm:p-2 text-[#FAF7F1]/80 hover:text-[#C95A1A] transition-colors rounded-full hover:bg-white/5"
                  aria-label="Search"
                >
                  <Search className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              )}
            </div>

            {/* Shopping Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-1.5 sm:p-2 text-[#FAF7F1] hover:text-[#C95A1A] transition-colors rounded-full hover:bg-white/5 flex items-center cursor-pointer"
              aria-label="View Shopping Cart"
            >
              <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6 text-[#FAF7F1]" />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 sm:top-0 sm:right-0 bg-[#C95A1A] text-[#FAF7F1] text-[10px] sm:text-[11px] font-bold w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center border-2 border-[#0F2747] animate-bounce">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-1.5 sm:p-2 text-[#FAF7F1] hover:text-[#C95A1A] rounded-lg hover:bg-white/5 cursor-pointer"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Animated Mobile Drawer Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-[#0F2747] border-b border-[#C95A1A]/30 px-4 sm:px-5 pt-2 sm:pt-3 pb-4 sm:pb-6 space-y-2 sm:space-y-3 overflow-hidden"
          >
            {/* Language Selection in Mobile Menu */}
            <div className="flex items-center justify-between pb-3 border-b border-[#C95A1A]/20">
              <span className="text-xs text-[#D8C3A5] font-semibold flex items-center space-x-1.5">
                <Globe className="w-4 h-4 text-[#C95A1A]" />
                <span>Language / ቋንቋ:</span>
              </span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setLanguage('en')}
                  className={`px-3 py-1 rounded-full text-xs font-bold ${
                    language === 'en' ? 'bg-[#C95A1A] text-[#FAF7F1]' : 'bg-[#142E52] text-[#D8C3A5]'
                  }`}
                >
                  🇬🇧 English
                </button>
                <button
                  onClick={() => setLanguage('am')}
                  className={`px-3 py-1 rounded-full text-xs font-bold ${
                    language === 'am' ? 'bg-[#C95A1A] text-[#FAF7F1]' : 'bg-[#142E52] text-[#D8C3A5]'
                  }`}
                >
                  🇪🇹 አማርኛ
                </button>
              </div>
            </div>

            <button
              onClick={() => {
                setActiveTab('home');
                setMobileMenuOpen(false);
              }}
              className={`block w-full text-left py-3 px-3 rounded-xl text-base font-medium transition-colors ${
                activeTab === 'home' ? 'bg-[#C95A1A]/20 text-[#C95A1A] font-bold' : 'text-[#FAF7F1] hover:bg-white/5'
              }`}
            >
              {t('nav.collection')}
            </button>
            <button
              onClick={() => {
                setActiveTab('contact');
                setMobileMenuOpen(false);
              }}
              className={`block w-full text-left py-3 px-3 rounded-xl text-base font-medium transition-colors ${
                activeTab === 'contact' ? 'bg-[#C95A1A]/20 text-[#C95A1A] font-bold' : 'text-[#FAF7F1] hover:bg-white/5'
              }`}
            >
              {t('nav.contact')}
            </button>
            <button
              onClick={() => {
                setActiveTab('admin');
                setMobileMenuOpen(false);
              }}
              className="flex items-center space-x-2.5 w-full text-left py-3 px-3 rounded-xl text-base font-medium text-[#D8C3A5] hover:bg-white/5 transition-colors"
            >
              <Lock className="w-4 h-4 text-[#C95A1A]" />
              <span>{isLoggedIn ? t('nav.adminDashboard') : t('nav.admin')}</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};


