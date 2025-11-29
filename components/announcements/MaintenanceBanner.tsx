'use client';

import { Wrench } from 'lucide-react';
import { useMaintenance } from '@/context/AnnouncementContext';
import { cn } from '@/lib/utils';

interface MaintenanceBannerProps {
  className?: string;
}

export function MaintenanceBanner({ className }: MaintenanceBannerProps) {
  const { isInMaintenance, maintenanceMessage, isLoading } = useMaintenance();

  if (isLoading || !isInMaintenance || !maintenanceMessage) {
    return null;
  }

  return (
    <div
      className={cn(
        'fixed top-0 left-0 right-0 z-50 w-full bg-gradient-to-r from-darker via-dark to-darker py-3 px-4 border-b border-primary/30',
        className
      )}
    >
      {/* Animated glow effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-secondary/10 to-primary/5 animate-pulse" />

      <div className="container mx-auto flex items-center justify-center gap-3 text-center relative">
        {/* Animated icon */}
        <div className="relative">
          <Wrench className="h-5 w-5 text-primary animate-bounce" />
          <div className="absolute inset-0 h-5 w-5 text-primary blur-sm animate-pulse" />
        </div>

        <div className="flex items-center gap-2">
          <span className="font-['Russo_One'] text-primary text-sm tracking-wide">
            {maintenanceMessage.title}
          </span>
          {maintenanceMessage.message && (
            <>
              <span className="text-gray-500">|</span>
              <span className="text-gray-300 text-sm">{maintenanceMessage.message}</span>
            </>
          )}
        </div>

        {/* Decorative dots */}
        <div className="hidden sm:flex items-center gap-1 ml-2">
          <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
          <span className="w-1.5 h-1.5 bg-secondary rounded-full animate-pulse delay-75" />
          <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse delay-150" />
        </div>
      </div>
    </div>
  );
}
