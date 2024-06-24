import { isMobile, isAndroid, isFirefox, isIOS, isOpera, browserVersion } from "mobile-device-detect";

export const platforms = {
  NATIVE: "NATIVE", // currently: Chrome, Edge mobile, Samsung internet
  FIREFOX: "FIREFOX",
  FIREFOX_NEW: "FIREFOX_NEW", // above version 79
  OPERA: "OPERA",
  IDEVICE: "IDEVICE",
  OTHER: "OTHER", // don't know, so will do nothing
} as const;

type Platform = keyof typeof platforms;

export function getPlatform(): Platform {
  let platform: Platform = platforms.OTHER;
  if (typeof window !== "undefined" && (window as any).hasOwnProperty("BeforeInstallPromptEvent")) {
    platform = platforms.NATIVE;
  } else if (isMobile && isAndroid && isFirefox && +browserVersion >= 79) {
    platform = platforms.FIREFOX_NEW;
  } else if (isMobile && isAndroid && isFirefox) {
    platform = platforms.FIREFOX;
  } else if (isOpera && isAndroid && isMobile) {
    platform = platforms.OPERA;
  } else if (isIOS && isMobile) {
    platform = platforms.IDEVICE;
  }

  return platform;
}