'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import type { Announcement, MaintenanceStatus } from '@/lib/api';

interface AnnouncementContextType {
  announcements: Announcement[];
  promotions: Announcement[];
  maintenanceStatus: MaintenanceStatus;
  isLoading: boolean;
  refreshAnnouncements: () => Promise<void>;
}

const AnnouncementContext = createContext<AnnouncementContextType | undefined>(undefined);

interface AnnouncementProviderProps {
  children: ReactNode;
}

export function AnnouncementProvider({ children }: AnnouncementProviderProps) {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [maintenanceStatus, setMaintenanceStatus] = useState<MaintenanceStatus>({
    isInMaintenance: false,
    announcement: null,
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchAnnouncements = useCallback(async () => {
    try {
      // Fetch active announcements
      const announcementsResponse = await fetch('/api/announcements', {
        cache: 'no-store',
      });

      if (announcementsResponse.ok) {
        const data = await announcementsResponse.json();
        if (data.success && data.data) {
          setAnnouncements(data.data);
        } else {
          setAnnouncements([]);
        }
      } else {
        setAnnouncements([]);
      }

      // Fetch maintenance status
      const maintenanceResponse = await fetch('/api/announcements/maintenance', {
        cache: 'no-store',
      });

      if (maintenanceResponse.ok) {
        const data = await maintenanceResponse.json();
        if (data.success && data.data) {
          // Map backend field name (isMaintenanceMode) to our interface (isInMaintenance)
          setMaintenanceStatus({
            isInMaintenance: data.data.isMaintenanceMode ?? data.data.isInMaintenance ?? false,
            announcement: data.data.announcement ?? null,
          });
        } else {
          setMaintenanceStatus({
            isInMaintenance: false,
            announcement: null,
          });
        }
      } else {
        setMaintenanceStatus({
          isInMaintenance: false,
          announcement: null,
        });
      }
    } catch {
      setAnnouncements([]);
      setMaintenanceStatus({
        isInMaintenance: false,
        announcement: null,
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshAnnouncements = async () => {
    setIsLoading(true);
    await fetchAnnouncements();
  };

  useEffect(() => {
    fetchAnnouncements();

    // Refetch every 5 minutes to keep announcements fresh
    const interval = setInterval(fetchAnnouncements, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchAnnouncements]);

  // Filter promotions
  const promotions = announcements.filter(a => a.type === 'PROMOTION');

  return (
    <AnnouncementContext.Provider
      value={{
        announcements,
        promotions,
        maintenanceStatus,
        isLoading,
        refreshAnnouncements
      }}
    >
      {children}
    </AnnouncementContext.Provider>
  );
}

export function useAnnouncements() {
  const context = useContext(AnnouncementContext);
  if (context === undefined) {
    throw new Error('useAnnouncements must be used within an AnnouncementProvider');
  }
  return context;
}

export function useMaintenance() {
  const { maintenanceStatus, isLoading } = useAnnouncements();
  return {
    isInMaintenance: maintenanceStatus.isInMaintenance,
    maintenanceMessage: maintenanceStatus.announcement,
    isLoading
  };
}

export function usePromotions() {
  const { promotions, isLoading } = useAnnouncements();
  return { promotions, isLoading };
}
