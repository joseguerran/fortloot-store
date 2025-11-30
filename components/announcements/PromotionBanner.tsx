'use client';

import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { usePromotions } from '@/context/AnnouncementContext';
import { cn } from '@/lib/utils';

interface PromotionBannerProps {
  className?: string;
  autoPlayInterval?: number;
  onHasPromotions?: (hasPromotions: boolean) => void;
}

// Countdown component
function Countdown({ targetDate }: { targetDate: Date }) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = targetDate.getTime() - new Date().getTime();

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  const TimeBox = ({ value, label }: { value: number; label: string }) => (
    <div className="flex flex-col items-center">
      <div className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-xl p-2 md:p-3 min-w-[55px] md:min-w-[75px]">
        <span className="text-2xl md:text-3xl font-bold text-white font-['Russo_One']">
          {String(value).padStart(2, '0')}
        </span>
      </div>
      <span className="text-[9px] md:text-[10px] text-gray-500 mt-2 uppercase tracking-widest font-medium">
        {label}
      </span>
    </div>
  );

  return (
    <div className="flex gap-3 md:gap-4 justify-center">
      <TimeBox value={timeLeft.days} label="Dias" />
      <span className="text-2xl text-white/30 font-light self-start mt-3">:</span>
      <TimeBox value={timeLeft.hours} label="Horas" />
      <span className="text-2xl text-white/30 font-light self-start mt-3">:</span>
      <TimeBox value={timeLeft.minutes} label="Min" />
      <span className="text-2xl text-white/30 font-light self-start mt-3">:</span>
      <TimeBox value={timeLeft.seconds} label="Seg" />
    </div>
  );
}

export function PromotionBanner({ className, autoPlayInterval = 12000, onHasPromotions }: PromotionBannerProps) {
  const { promotions, isLoading } = usePromotions();
  const [currentIndex, setCurrentIndex] = useState(0);

  // Notify parent about promotions status
  useEffect(() => {
    if (!isLoading && onHasPromotions) {
      onHasPromotions(promotions.length > 0);
    }
  }, [promotions.length, isLoading, onHasPromotions]);

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
  const hasEndDate = currentPromotion.endsAt && new Date(currentPromotion.endsAt) > new Date();

  const hasImage = !!currentPromotion.imageUrl;
  const isBase64 = currentPromotion.imageUrl?.startsWith('data:');

  // Determine the link URL for the banner
  // If product is linked, use its name as search query
  const bannerLink = currentPromotion.product?.name
    ? `/tienda?search=${encodeURIComponent(currentPromotion.product.name)}`
    : currentPromotion.linkUrl || null;

  // Wrapper component - either a Link or a div
  const BannerWrapper = ({ children }: { children: React.ReactNode }) => {
    if (bannerLink) {
      return (
        <Link href={bannerLink} className="block cursor-pointer">
          {children}
        </Link>
      );
    }
    return <>{children}</>;
  };

  return (
    <div className={cn('w-full bg-black', className)}>
      <BannerWrapper>
      <div
        className={cn(
          "relative overflow-hidden rounded-2xl h-[350px] md:h-[400px] lg:h-[450px] border-2 border-primary/30",
          bannerLink && "hover:border-primary/50 transition-all duration-300"
        )}
        style={{
          boxShadow: "0 0 20px rgba(173, 255, 47, 0.15), 0 0 40px rgba(173, 255, 47, 0.1), inset 0 0 60px rgba(0, 0, 0, 0.3)"
        }}
      >
        {/* Base dark background */}
        <div className="absolute inset-0 bg-[#0a0a0f]" />

        {/* Background Image (if provided) - shown without overlay for clarity */}
        {hasImage && currentPromotion.imageUrl ? (
          <div className="absolute inset-0 z-[5]">
            {isBase64 ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={currentPromotion.imageUrl}
                alt="Promotion background"
                className="w-full h-full object-cover"
              />
            ) : (
              <Image
                src={currentPromotion.imageUrl}
                alt="Promotion background"
                fill
                className="object-cover"
                unoptimized
              />
            )}
          </div>
        ) : (
          /* Dark gradient overlay for promotions without image */
          <div className="absolute inset-0 z-[5] bg-gradient-to-t from-[#0a0a0f] via-[#0a0a0f]/70 to-[#0a0a0f]/30" />
        )}

        {/* Subtle glow effects (visible on both, but stronger without image) */}
        <div className={cn(
          "absolute top-0 left-0 w-[400px] h-[400px] rounded-full blur-[150px] -translate-x-1/2 -translate-y-1/2",
          hasImage ? "bg-primary/15" : "bg-primary/25"
        )} />
        <div className={cn(
          "absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full blur-[150px] translate-x-1/2 translate-y-1/2",
          hasImage ? "bg-[#FF007A]/15" : "bg-[#FF007A]/25"
        )} />
        <div className={cn(
          "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[200px] rounded-full blur-[100px]",
          hasImage ? "bg-secondary/10" : "bg-secondary/20"
        )} />

        {/* Subtle accent line at top */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="relative z-10 flex flex-col items-center justify-center text-center px-6 py-10 md:py-14 h-full"
          >
            {/* Title (optional) */}
            {currentPromotion.title && (
              <h2 className="font-['Russo_One'] text-3xl md:text-5xl lg:text-6xl text-white mb-3 md:mb-4 tracking-wide drop-shadow-lg">
                {currentPromotion.title}
              </h2>
            )}

            {/* Subtitle / Message (optional) */}
            {currentPromotion.message && (
              <p className="text-gray-300 text-base md:text-xl max-w-2xl">
                {currentPromotion.message}
              </p>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Countdown Timer - Fixed at bottom (if has end date) */}
        {hasEndDate && (
          <div className="absolute bottom-8 md:bottom-10 left-0 right-0 z-10 flex flex-col items-center">
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-3">Termina en</p>
            <Countdown targetDate={new Date(currentPromotion.endsAt!)} />
          </div>
        )}

        {/* Navigation Arrows (only if multiple promotions) */}
        {promotions.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                prevSlide();
              }}
              className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-dark/60 backdrop-blur-sm text-white/70 hover:text-primary hover:bg-dark/80 transition-all z-20 border border-white/10"
              aria-label="Anterior promoción"
            >
              <ChevronLeft className="h-5 w-5 md:h-6 md:w-6" />
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                nextSlide();
              }}
              className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-dark/60 backdrop-blur-sm text-white/70 hover:text-primary hover:bg-dark/80 transition-all z-20 border border-white/10"
              aria-label="Siguiente promoción"
            >
              <ChevronRight className="h-5 w-5 md:h-6 md:w-6" />
            </button>
          </>
        )}

        {/* Dots Indicator (only if multiple promotions) */}
        {promotions.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 z-20">
            {promotions.map((_, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setCurrentIndex(index);
                }}
                className={cn(
                  'h-2 rounded-full transition-all duration-300',
                  index === currentIndex
                    ? 'bg-primary w-6'
                    : 'bg-white/30 w-2 hover:bg-white/50'
                )}
                aria-label={`Ir a promoción ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
      </BannerWrapper>
    </div>
  );
}
