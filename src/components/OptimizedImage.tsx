'use client';

import React, { useState } from 'react';
import {
  getOptimizedImageUrl,
  getCardImageUrl,
  getDetailImageUrl,
  getThumbnailImageUrl,
  getZoomImageUrl,
  getHeroImageUrl,
  getCardSrcSet,
  getDetailSrcSet,
  getHeroSrcSet,
  FALLBACK_CROCHET_IMAGE
} from '../utils/imageOptimizer';

export type ImagePreset = 'card' | 'detail' | 'thumbnail' | 'hero' | 'zoom' | 'custom';

export interface OptimizedImageProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src?: string | null;
  alt: string;
  preset?: ImagePreset;
  width?: number;
  height?: number;
  priority?: boolean;
  className?: string;
  containerClassName?: string;
  sizes?: string;
  aspectRatio?: string;
  fallbackSrc?: string;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  preset = 'card',
  width,
  height,
  priority = false,
  className = '',
  containerClassName = '',
  sizes,
  aspectRatio,
  fallbackSrc = FALLBACK_CROCHET_IMAGE,
  ...restProps
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Compute optimized src based on preset
  let optimizedSrc = fallbackSrc;
  let responsiveSrcSet = '';
  let defaultSizes = '';

  const activeSrc = hasError ? fallbackSrc : (src || fallbackSrc);

  switch (preset) {
    case 'card':
      optimizedSrc = getCardImageUrl(activeSrc);
      responsiveSrcSet = getCardSrcSet(activeSrc);
      defaultSizes = sizes || '(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 450px';
      break;
    case 'detail':
      optimizedSrc = getDetailImageUrl(activeSrc);
      responsiveSrcSet = getDetailSrcSet(activeSrc);
      defaultSizes = sizes || '(max-width: 768px) 100vw, 600px';
      break;
    case 'thumbnail':
      optimizedSrc = getThumbnailImageUrl(activeSrc);
      defaultSizes = sizes || '64px';
      break;
    case 'hero':
      optimizedSrc = getHeroImageUrl(activeSrc);
      responsiveSrcSet = getHeroSrcSet(activeSrc);
      defaultSizes = sizes || '(max-width: 640px) 90vw, 550px';
      break;
    case 'zoom':
      optimizedSrc = getZoomImageUrl(activeSrc);
      defaultSizes = sizes || '100vw';
      break;
    case 'custom':
    default:
      optimizedSrc = getOptimizedImageUrl(activeSrc, { width, height });
      defaultSizes = sizes || '100vw';
      break;
  }

  // Pre-configured dimensions for preventing Cumulative Layout Shift (CLS)
  const inferredWidth = width || (preset === 'card' ? 450 : preset === 'thumbnail' ? 160 : preset === 'hero' ? 800 : undefined);
  const inferredHeight = height || (preset === 'card' ? 338 : preset === 'thumbnail' ? 160 : preset === 'hero' ? 600 : undefined);

  return (
    <div
      className={`relative overflow-hidden bg-[#0F2747]/40 ${containerClassName}`}
      style={aspectRatio ? { aspectRatio } : undefined}
    >
      {/* Subtle Warm Luxury Shimmer Placeholder while loading */}
      {!isLoaded && (
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-r from-[#0F2747]/50 via-[#C95A1A]/10 to-[#0F2747]/50 animate-pulse pointer-events-none z-0"
        />
      )}

      {/* Optimized Image */}
      <img
        src={optimizedSrc}
        srcSet={responsiveSrcSet || undefined}
        sizes={defaultSizes}
        alt={alt}
        width={inferredWidth}
        height={inferredHeight}
        loading={priority ? 'eager' : 'lazy'}
        // @ts-ignore fetchpriority HTML attribute supported by modern browsers
        fetchpriority={priority ? 'high' : 'auto'}
        decoding="async"
        referrerPolicy="no-referrer"
        onLoad={() => setIsLoaded(true)}
        onError={() => {
          if (!hasError) {
            setHasError(true);
          }
        }}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        } ${className}`}
        {...restProps}
      />
    </div>
  );
};
