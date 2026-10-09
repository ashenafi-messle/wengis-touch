import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { getZoomImageUrl } from '../utils/imageOptimizer';

interface ImageLightboxProps {
  images: string[];
  initialIndex?: number;
  onClose: () => void;
  alt?: string;
}

export const ImageLightbox: React.FC<ImageLightboxProps> = ({
  images,
  initialIndex = 0,
  onClose,
  alt = 'Image preview'
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
    if (e.key === 'ArrowLeft') handlePrevious();
    if (e.key === 'ArrowRight') handleNext();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-[#0F2747]/95 backdrop-blur-lg flex items-center justify-center p-4"
      onClick={onClose}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {/* Close Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        className="absolute top-4 right-4 z-20 w-12 h-12 rounded-full bg-[#C95A1A] text-[#FAF7F1] flex items-center justify-center hover:bg-[#A94712] transition-colors cursor-pointer shadow-xl"
        aria-label="Close"
      >
        <X className="w-6 h-6" />
      </button>

      <div
        className="relative max-w-4xl max-h-[70vh] w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={getZoomImageUrl(images[currentIndex] || images[0])}
          alt={`${alt} ${currentIndex + 1}`}
          className="w-full h-full object-contain rounded-2xl shadow-2xl"
          referrerPolicy="no-referrer"
          style={{ maxHeight: '70vh' }}
        />

        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={handlePrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-[#0F2747]/80 text-[#FAF7F1] flex items-center justify-center hover:bg-[#C95A1A] transition-colors cursor-pointer shadow-xl"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-[#0F2747]/80 text-[#FAF7F1] flex items-center justify-center hover:bg-[#C95A1A] transition-colors cursor-pointer shadow-xl"
              aria-label="Next image"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}

        {/* Image Counter */}
        {images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-[#0F2747]/80 text-[#FAF7F1] px-4 py-2 rounded-full text-sm font-semibold">
            {currentIndex + 1} / {images.length}
          </div>
        )}
      </div>
    </div>
  );
};
