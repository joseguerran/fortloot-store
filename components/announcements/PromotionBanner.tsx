'use client';

import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, ExternalLink, Gift } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { usePromotions } from '@/context/AnnouncementContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import type { Announcement } from '@/lib/api';

interface PromotionBannerProps {
  className?: string;
  autoPlayInterval?: number;
}

export function PromotionBanner({ className, autoPlayInterval = 5000 }: PromotionBannerProps) {
  const { promotions, isLoading } = usePromotions();
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % promotions.length);
  }, [promotions.length]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + promotions.length) % promotions.length);
  }, [promotions.length]);

  // Auto-play
  useEffect(() => {
    if (promotions.length <= 1) return;

    const interval = setInterval(nextSlide, autoPlayInterval);
    return () => clearInterval(interval);
  }, [promotions.length, autoPlayInterval, nextSlide]);

  if (isLoading || promotions.length === 0) {
    return null;
  }

  const currentPromotion = promotions[currentIndex];

  return (
    <div className={cn('w-full', className)}>
      <div className="relative overflow-hidden bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-700 rounded-lg shadow-lg">
        {/* Promotion Content */}
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between p-4 md:p-6 gap-4">
          {/* Text Content */}
          <div className="flex-1 text-white text-center md:text-left">
            <h3 className="text-lg md:text-xl font-bold mb-1">
              {currentPromotion.title}
            </h3>
            <p className="text-sm md:text-base text-purple-100">
              {currentPromotion.message}
            </p>
          </div>

          {/* Product Reference or Image */}
          {currentPromotion.product && (
            <div className="flex items-center gap-3 bg-white/10 rounded-lg p-3">
              {currentPromotion.product.image && (
                <div className="relative w-12 h-12 md:w-16 md:h-16 rounded-md overflow-hidden flex-shrink-0">
                  <Image
                    src={currentPromotion.product.image}
                    alt={currentPromotion.product.name}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <div className="text-white">
                <p className="text-xs text-purple-200">Producto destacado</p>
                <p className="font-semibold text-sm md:text-base">
                  {currentPromotion.product.name}
                </p>
              </div>
            </div>
          )}

          {currentPromotion.imageUrl && !currentPromotion.product && (
            <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-lg overflow-hidden flex-shrink-0">
              <Image
                src={currentPromotion.imageUrl}
                alt={currentPromotion.title}
                fill
                className="object-cover"
              />
            </div>
          )}

          {/* CTA Button */}
          {currentPromotion.linkUrl && (
            <Link
              href={currentPromotion.linkUrl}
              className="flex-shrink-0"
            >
              <Button
                variant="secondary"
                className="bg-white text-purple-700 hover:bg-purple-100 font-semibold"
              >
                {currentPromotion.linkText || 'Ver oferta'}
                <ExternalLink className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          )}

          {currentPromotion.product && !currentPromotion.linkUrl && (
            <Link
              href={`/tienda?highlight=${currentPromotion.product.id}`}
              className="flex-shrink-0"
            >
              <Button
                variant="secondary"
                className="bg-white text-purple-700 hover:bg-purple-100 font-semibold"
              >
                Ver producto
                <Gift className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          )}
        </div>

        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full translate-y-1/2 -translate-x-1/2" />
        </div>

        {/* Navigation Arrows (only if multiple promotions) */}
        {promotions.length > 1 && (
          <>
            <button
              onClick={prevSlide}
              className="absolute left-2 top-1/2 -translate-y-1/2 p-1 rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors z-20"
              aria-label="Anterior promoción"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors z-20"
              aria-label="Siguiente promoción"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}

        {/* Dots Indicator (only if multiple promotions) */}
        {promotions.length > 1 && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
            {promotions.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={cn(
                  'w-2 h-2 rounded-full transition-colors',
                  index === currentIndex
                    ? 'bg-white'
                    : 'bg-white/40 hover:bg-white/60'
                )}
                aria-label={`Ir a promoción ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
