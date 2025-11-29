'use client';

import { MaintenanceBanner } from './MaintenanceBanner';
import { PromotionBanner } from './PromotionBanner';

interface AnnouncementBannersProps {
  showMaintenance?: boolean;
  showPromotions?: boolean;
  promotionClassName?: string;
}

export function AnnouncementBanners({
  showMaintenance = true,
  showPromotions = true,
  promotionClassName,
}: AnnouncementBannersProps) {
  return (
    <>
      {showMaintenance && <MaintenanceBanner />}
      {showPromotions && (
        <div className="container mx-auto px-4 py-4">
          <PromotionBanner className={promotionClassName} />
        </div>
      )}
    </>
  );
}
