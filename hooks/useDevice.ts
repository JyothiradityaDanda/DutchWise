'use client';

import { useState, useEffect } from 'react';
import { detectDevice, getLayoutConfig, type DeviceInfo } from '@/lib/deviceDetection';

export function useDevice() {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>(() => detectDevice());
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // Update device info on mount (client-side)
    setDeviceInfo(detectDevice());
    setIsHydrated(true);

    // Update on resize
    const handleResize = () => {
      setDeviceInfo(detectDevice());
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const layoutConfig = getLayoutConfig(deviceInfo);

  return {
    ...deviceInfo,
    layoutConfig,
    isHydrated,
  };
}

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }

    const listener = () => setMatches(media.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [matches, query]);

  return matches;
}
