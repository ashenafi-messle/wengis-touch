import React from 'react';
import { Sparkles, Heart, Shield, Award, Feather } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const heroImg = 'https://res.cloudinary.com/dr9umkixr/image/upload/v1785740760/5999336664565747219_lwjry4.jpg';
const flowersImg = 'https://res.cloudinary.com/dr9umkixr/image/upload/v1785740760/5999336664565747217_bl8dmp.jpg';

export const BrandStory: React.FC = () => {
  const { language, t } = useLanguage();

  return (
    <section className="py-8 sm:py-20 bg-[#0F2747] text-[#FAF7F1] relative overflow-hidden border-y border-[#C95A1A]/30">
      
      {/* Background Subtle Luxury Grid Glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#C95A1A]/10 rounded-full blur-3xl pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-12 items-center">
          
          {/* Visual Showcase Collage - Compact 2-column flex on mobile */}
          <div className="lg:col-span-6 grid grid-cols-2 gap-2.5 sm:gap-4">
            <div className="space-y-2.5 sm:space-y-4">
              <div className="rounded-xl sm:rounded-2xl overflow-hidden border border-[#C95A1A]/30 shadow-lg">
                <img
                  src={heroImg}
                  alt="Wengi Atelier Craft"
                  className="w-full h-36 sm:h-72 object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="bg-[#142E52] p-3 sm:p-5 rounded-xl sm:rounded-2xl border border-[#C95A1A]/20 text-left">
                <Feather className="w-4 h-4 sm:w-6 sm:h-6 text-[#C95A1A] mb-1 sm:mb-2" />
                <h4 className="font-serif-luxury text-xs sm:text-lg font-bold text-[#FAF7F1]">
                  {language === 'am' ? 'ህንፃዊ ሌስ ሽመና' : 'Architectural Lace'}
                </h4>
                <p className="text-[10px] sm:text-xs text-[#D8C3A5] font-light mt-0.5 line-clamp-2 sm:line-clamp-none">
                  {language === 'am' ? 'ከፈረንሳይ ፓሪስ አርኪቴክቸር ጥበብ የተወሰደ' : 'Inspired by classic Parisian stone arches & lace balconies.'}
                </p>
              </div>
            </div>

            <div className="space-y-2.5 sm:space-y-4 sm:pt-8">
              <div className="bg-[#142E52] p-3 sm:p-5 rounded-xl sm:rounded-2xl border border-[#C95A1A]/20 text-left">
                <Award className="w-4 h-4 sm:w-6 sm:h-6 text-[#C95A1A] mb-1 sm:mb-2" />
                <h4 className="font-serif-luxury text-xs sm:text-lg font-bold text-[#FAF7F1]">
                  {language === 'am' ? 'ተፈጥሯዊ የቅንጦት ጥበብ' : 'Ethical Luxury'}
                </h4>
                <p className="text-[10px] sm:text-xs text-[#D8C3A5] font-light mt-0.5 line-clamp-2 sm:line-clamp-none">
                  {language === 'am' ? '100% ተፈጥሯዊ የአክሪሊክ ጥጥ' : '100% natural acrylic yarn.'}
                </p>
              </div>
              <div className="rounded-xl sm:rounded-2xl overflow-hidden border border-[#C95A1A]/30 shadow-lg">
                <img
                  src={flowersImg}
                  alt="Crochet Floral Art"
                  className="w-full h-32 sm:h-64 object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
            </div>
          </div>

          {/* Editorial Content Text */}
          <div className="lg:col-span-6 text-left space-y-3 sm:space-y-6">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#142E52] border border-[#C95A1A]/40 text-[#D8C3A5] text-[10px] sm:text-xs font-semibold tracking-widest uppercase">
              <Sparkles className="w-3 h-3 text-[#C95A1A]" />
              <span>{t('story.badge')}</span>
            </div>

            <h2 className="font-serif-luxury text-2xl sm:text-4xl font-bold leading-tight">
              {t('story.title')}
            </h2>

            <p className="text-xs sm:text-sm text-[#D8C3A5] leading-relaxed font-light">
              {t('story.p1')}
            </p>

            <p className="text-xs sm:text-sm text-[#D8C3A5] leading-relaxed font-light hidden sm:block">
              {t('story.p2')}
            </p>

            {/* Founder Note Blockquote */}
            <div className="p-3.5 sm:p-5 rounded-xl sm:rounded-2xl bg-[#142E52] border-l-4 border-[#C95A1A] italic text-xs text-[#FAF7F1] space-y-1 sm:space-y-2">
              <p className="text-[11px] sm:text-xs">
                "{t('story.quote')}"
              </p>
              <span className="not-italic text-[9px] sm:text-[10px] font-bold text-[#C95A1A] uppercase tracking-widest block">
                — {t('story.author')}
              </span>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
};
