'use client';

import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export interface BackButtonProps {
  onClick?: () => void;
  onFallback?: () => void;
  fallbackUrl?: string;
  label?: string;
  title?: string;
  className?: string;
  ariaLabel?: string;
  variant?: 'solid' | 'ghost' | 'pill';
  size?: 'sm' | 'md';
}

export const BackButton: React.FC<BackButtonProps> = ({
  onClick,
  onFallback,
  fallbackUrl,
  label,
  title,
  className = '',
  ariaLabel,
  variant = 'solid',
  size = 'md'
}) => {
  const { language } = useLanguage();

  const defaultLabel = language === 'am' ? 'ተመለስ' : 'Back';
  const displayLabel = label || defaultLabel;
  const accessibleLabel = ariaLabel || title || displayLabel;

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    // 1. Explicit onClick handler provided by parent component
    if (onClick) {
      onClick();
      return;
    }

    // 2. Check if the browser has a valid same-site previous page in history
    if (typeof window !== 'undefined') {
      const hasHistory = window.history.length > 1;
      const referrer = typeof document !== 'undefined' ? document.referrer : '';
      const isSameSiteReferrer =
        referrer && (referrer.startsWith(window.location.origin) || referrer.startsWith(window.location.host));

      if (hasHistory && (isSameSiteReferrer || !referrer)) {
        window.history.back();
        return;
      }
    }

    // 3. Safe parent/fallback handler
    if (onFallback) {
      onFallback();
      return;
    }

    // 4. Fallback URL (ensuring it is safe and never redirects to external sites)
    if (fallbackUrl && fallbackUrl.startsWith('/')) {
      if (typeof window !== 'undefined') {
        window.location.href = fallbackUrl;
        return;
      }
    }

    // 5. Default safe fallback to home without page reload
    if (typeof window !== 'undefined') {
      if (window.location.hash) {
        window.location.hash = '';
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick(e as any);
    }
  };

  const sizeClasses =
    size === 'sm'
      ? 'px-3 py-1.5 text-[11px] gap-1.5'
      : 'px-4 py-2 text-xs gap-2';

  const variantClasses =
    variant === 'ghost'
      ? 'bg-transparent text-[#D8C3A5] hover:text-[#FAF7F1] hover:bg-[#C95A1A]/20 border border-[#C95A1A]/30'
      : variant === 'pill'
      ? 'bg-[#0F2747]/90 text-[#FAF7F1] hover:bg-[#C95A1A] border border-[#C95A1A]/50 shadow-md backdrop-blur-md'
      : 'bg-[#142E52] border border-[#C95A1A]/40 text-[#D8C3A5] hover:bg-[#C95A1A] hover:text-[#FAF7F1] shadow-sm';

  return (
    <button
      type="button"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      aria-label={accessibleLabel}
      title={title || displayLabel}
      className={`inline-flex items-center rounded-full font-semibold uppercase tracking-wider transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#C95A1A] focus:ring-offset-2 focus:ring-offset-[#0F2747] cursor-pointer select-none shrink-0 ${sizeClasses} ${variantClasses} ${className}`}
    >
      <ArrowLeft className={size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'} aria-hidden="true" />
      <span>{displayLabel}</span>
    </button>
  );
};
