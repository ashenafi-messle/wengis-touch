import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, ArrowRight, Heart, Code, Phone, User } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface FooterProps {
  setActiveTab: (tab: 'home' | 'contact' | 'admin') => void;
}

export const Footer: React.FC<FooterProps> = ({ setActiveTab }) => {
  const { language, t } = useLanguage();
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail) {
      setSubscribed(true);
      setNewsletterEmail('');
      setTimeout(() => setSubscribed(false), 4000);
    }
  };

  return (
    <footer className="bg-[#0F2747] text-[#FAF7F1] border-t border-[#C95A1A]/30 pt-8 sm:pt-16 pb-8 sm:pb-12 px-3 sm:px-6 lg:px-8 text-left relative overflow-hidden">

      {/* Decorative Warm Ambient Glow */}
      <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-[400px] sm:w-[600px] h-40 sm:h-60 bg-[#C95A1A]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-4 sm:gap-8 md:gap-12 relative z-10">

        {/* Brand Column */}
        <div className="sm:col-span-2 md:col-span-4 space-y-2 sm:space-y-4">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="flex items-center space-x-2 sm:space-x-3 cursor-pointer inline-flex select-none"
            onClick={() => setActiveTab('home')}
          >
            <motion.div
              animate={{
                rotate: [0, 5, -5, 0],
                scale: [1, 1.05, 1],
                filter: [
                  "brightness(1) saturate(1)",
                  "brightness(1.1) saturate(1.2)",
                  "brightness(1) saturate(1)"
                ]
              }}
              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden shadow-lg border-2 border-[#C95A1A]/50 shrink-0 relative"
            >
              <motion.img
                src="/logo.jpg"
                alt="Wengi's Touch Logo"
                className="w-full h-full object-cover"
                animate={{
                  scale: [1, 1.1, 1],
                }}
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              />
              <motion.div
                className="absolute inset-0 rounded-full"
                animate={{
                  boxShadow: [
                    "inset 0 0 0px rgba(201,90,26,0)",
                    "inset 0 0 20px rgba(201,90,26,0.3)",
                    "inset 0 0 0px rgba(201,90,26,0)"
                  ]
                }}
                transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
              />
            </motion.div>
            <div className="flex flex-col text-left">
              <motion.span
                animate={{
                  color: [
                    "#FAF7F1",
                    "#C95A1A",
                    "#F3E7D3",
                    "#FAF7F1"
                  ]
                }}
                transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
                className="font-serif-luxury text-lg sm:text-2xl font-bold tracking-wider block"
              >
                {language === 'am' ? 'ወንጊስ' : 'Wengi\'s'} <span className="italic font-normal">{language === 'am' ? 'ተች' : 'Touch'}</span>
              </motion.span>
            </div>
          </motion.div>

          <p className="text-[11px] sm:text-xs text-[#D8C3A5] leading-relaxed font-light max-w-sm line-clamp-2 sm:line-clamp-none">
            {t('footer.tagline')}
          </p>

          {/* Atelier Highlights / Footer Images */}
          <div className="flex items-center gap-2 pt-1">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg overflow-hidden border border-[#C95A1A]/40 shadow-sm shrink-0">
              <img
                src="https://res.cloudinary.com/oydsg6yc/image/upload/v1791528555/ee6fe89a61780d65c8c1f2aa501c3470.jpg"
                alt="Wengi Atelier Craft"
                loading="lazy"
                className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
              />
            </div>
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg overflow-hidden border border-[#C95A1A]/40 shadow-sm shrink-0">
              <img
                src="https://res.cloudinary.com/oydsg6yc/image/upload/v1791528542/5ed8cbca7e257097c4672381d8b0a7a2.jpg"
                alt="Wengi Atelier Floral"
                loading="lazy"
                className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
              />
            </div>
          </div>
        </div>

        {/* Developer Info Column */}
        <div className="md:col-span-4 space-y-2 sm:space-y-3">
          <h4 className="text-[11px] sm:text-xs font-bold uppercase tracking-widest text-[#C95A1A] flex items-center gap-1.5">
            <Code className="w-3 h-3.5 sm:w-3.5 sm:h-3.5" />
            <span>{language === 'am' ? 'የሶፍትዌር ዲዛይነር' : 'Developer'}</span>
          </h4>
          <div className="space-y-1.5 sm:space-y-2.5 text-[11px] sm:text-xs text-[#D8C3A5] font-light">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#C95A1A] shrink-0" />
              <span className="font-semibold text-[#FAF7F1] text-xs sm:text-sm">Ashenafi Messle</span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#C95A1A] shrink-0" />
              <a
                href="mailto:ashurack664@gmail.com"
                className="hover:text-[#FAF7F1] transition-colors underline underline-offset-2 decoration-[#C95A1A]/40 hover:decoration-[#C95A1A]"
              >
                ashurack664@gmail.com
              </a>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#C95A1A] shrink-0" />
              <a
                href="tel:0997278932"
                className="hover:text-[#FAF7F1] transition-colors"
              >
                0997278932
              </a>
            </div>
          </div>
        </div>

        {/* Newsletter Column */}
        <div className="md:col-span-4 space-y-2 sm:space-y-3">
          <h4 className="text-[11px] sm:text-xs font-bold uppercase tracking-widest text-[#C95A1A]">
            {t('footer.newsletter.title')}
          </h4>
          <p className="text-[11px] sm:text-xs text-[#D8C3A5] font-light line-clamp-2 sm:line-clamp-none">
            {t('footer.newsletter.desc')}
          </p>

          {subscribed ? (
            <div className="p-2 sm:p-3 bg-emerald-900/60 border border-emerald-500 text-emerald-200 text-[11px] sm:text-xs rounded-lg sm:rounded-xl">
              {t('footer.newsletter.subscribed')}
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="flex items-center bg-[#142E52] border border-[#C95A1A]/40 rounded-full p-1 sm:p-1.5">
              <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#D8C3A5] ml-2 sm:ml-3 shrink-0" />
              <input
                type="email"
                required
                placeholder={language === 'am' ? 'ኢሜይል...' : 'Email...'}
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                className="bg-transparent text-[11px] sm:text-xs text-[#FAF7F1] placeholder-[#D8C3A5]/60 focus:outline-none px-1.5 sm:px-2 w-full min-w-0"
              />
              <button
                type="submit"
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#C95A1A] hover:bg-[#A94712] text-[#FAF7F1] flex items-center justify-center shrink-0 transition-colors cursor-pointer"
                title="Subscribe"
              >
                <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            </form>
          )}
        </div>

      </div>

      {/* Copyright Bar */}
      <div className="max-w-7xl mx-auto mt-6 sm:mt-12 pt-4 sm:pt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between text-[10px] sm:text-[11px] text-[#D8C3A5]/70 font-light gap-3 sm:gap-4 text-center md:text-left">
        <p>© {new Date().getFullYear()} {t('footer.copyright')}</p>

        <div className="flex flex-wrap items-center justify-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs">
          <span>{language === 'am' ? 'የተገነባው በ' : 'Designed & Developed by'}</span>
          <span className="font-semibold text-[#FAF7F1]">Ashenafi Messle</span>
          <span className="text-[#C95A1A]">•</span>
          <a href="mailto:ashurack664@gmail.com" className="hover:text-[#FAF7F1] transition-colors underline decoration-[#C95A1A]/40">ashurack664@gmail.com</a>
          <span className="text-[#C95A1A]">•</span>
          <a href="tel:0997278932" className="hover:text-[#FAF7F1] transition-colors">0997278932</a>
        </div>

        <p className="flex items-center space-x-1">
          <span>Crafted with</span>
          <Heart className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[#C95A1A] inline" />
          <span>in Paris & Worldwide</span>
        </p>
      </div>
    </footer>
  );
};

