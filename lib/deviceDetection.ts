export type DeviceType = 'mobile' | 'tablet' | 'desktop';
export type PlatformType = 'ios' | 'android' | 'web';
export type DisplayMode = 'standalone' | 'browser';

export interface DeviceInfo {
  deviceType: DeviceType;
  platform: PlatformType;
  displayMode: DisplayMode;
  isIOS: boolean;
  isAndroid: boolean;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isStandalone: boolean;
  isBrowser: boolean;
  isPWA: boolean;
  isTouchDevice: boolean;
  screenSize: {
    width: number;
    height: number;
  };
}

export function detectDevice(): DeviceInfo {
  // Check if we're in browser environment
  if (typeof window === 'undefined') {
    return getDefaultDeviceInfo();
  }

  const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera || '';
  const width = window.innerWidth;
  const height = window.innerHeight;

  // Detect iOS
  const isIOS = /iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream;

  // Detect Android
  const isAndroid = /android/i.test(userAgent);

  // Detect if running as PWA/Standalone
  const isStandalone =
    (window.matchMedia('(display-mode: standalone)').matches) ||
    (navigator as any).standalone === true ||
    document.referrer.includes('android-app://');

  // Detect device type
  let deviceType: DeviceType = 'desktop';
  if (width < 768) {
    deviceType = 'mobile';
  } else if (width < 1024) {
    deviceType = 'tablet';
  }

  // Detect platform
  let platform: PlatformType = 'web';
  if (isIOS) {
    platform = 'ios';
  } else if (isAndroid) {
    platform = 'android';
  }

  // Detect if touch device
  const isTouchDevice =
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    (navigator as any).msMaxTouchPoints > 0;

  const displayMode: DisplayMode = isStandalone ? 'standalone' : 'browser';

  return {
    deviceType,
    platform,
    displayMode,
    isIOS,
    isAndroid,
    isMobile: deviceType === 'mobile',
    isTablet: deviceType === 'tablet',
    isDesktop: deviceType === 'desktop',
    isStandalone,
    isBrowser: !isStandalone,
    isPWA: isStandalone,
    isTouchDevice,
    screenSize: { width, height },
  };
}

export function getDefaultDeviceInfo(): DeviceInfo {
  return {
    deviceType: 'desktop',
    platform: 'web',
    displayMode: 'browser',
    isIOS: false,
    isAndroid: false,
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    isStandalone: false,
    isBrowser: true,
    isPWA: false,
    isTouchDevice: false,
    screenSize: { width: 1920, height: 1080 },
  };
}

export function getSafeAreaInsets(): { top: number; bottom: number; left: number; right: number } {
  if (typeof window === 'undefined') {
    return { top: 0, bottom: 0, left: 0, right: 0 };
  }

  const style = getComputedStyle(document.documentElement);

  return {
    top: parseInt(style.getPropertyValue('--safe-area-inset-top') || '0'),
    bottom: parseInt(style.getPropertyValue('--safe-area-inset-bottom') || '0'),
    left: parseInt(style.getPropertyValue('--safe-area-inset-left') || '0'),
    right: parseInt(style.getPropertyValue('--safe-area-inset-right') || '0'),
  };
}

// Get optimized layout config based on device
export function getLayoutConfig(deviceInfo: DeviceInfo) {
  if (deviceInfo.isPWA && deviceInfo.isIOS) {
    return {
      showHeader: false, // Hide header on iOS PWA (uses notch area)
      showBottomNav: true,
      padding: {
        top: 'safe-area-inset-top',
        bottom: 'safe-area-inset-bottom',
      },
      maxWidth: '100%',
      animations: 'reduced', // Smoother on mobile
    };
  }

  if (deviceInfo.isMobile) {
    return {
      showHeader: false,
      showBottomNav: true,
      padding: {
        top: '0',
        bottom: '0',
      },
      maxWidth: '100%',
      animations: 'full',
    };
  }

  return {
    showHeader: true,
    showBottomNav: false,
    padding: {
      top: '0',
      bottom: '0',
    },
    maxWidth: '7xl',
    animations: 'full',
  };
}
