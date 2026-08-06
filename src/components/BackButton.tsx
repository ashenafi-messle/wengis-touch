import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface BackButtonProps {
  onClick: () => void;
  className?: string;
}

export const BackButton: React.FC<BackButtonProps> = ({ onClick, className = '' }) => {
  const { language } = useLanguage();

  return (
    <button
      onClick={onClick}
      className={`flex items-center space-x-2 px-4 py-2 rounded-full bg-[#142E52] border border-[#C95A1A]/40 text-[#D8C3A5] hover:bg-[#C95A1A] hover:text-[#FAF7F1] transition-all duration-300 text-xs font-semibold tracking-wider uppercase ${className}`}
    >
      <ArrowLeft className="w-4 h-4" />
      <span>{language === 'am' ? 'ተመለስ' : 'Back'}</span>
    </button>
  );
};
