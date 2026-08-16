const HUAWEI_APPGALLERY_HOSTS = ["appgallery.huawei.com", "appgallery.cloud.huawei.com"];

function isAndroidDevice() {
  return /Android/i.test(navigator.userAgent);
}

function isHuaweiAppGalleryUrl(storeUrl: string) {
  try {
    const hostname = new URL(storeUrl).hostname.toLowerCase();
    return HUAWEI_APPGALLERY_HOSTS.some((host) => hostname === host || hostname.endsWith(`.${host}`));
  } catch {
    return false;
  }
}

export function openStoreUrl(storeUrl: string, event?: { preventDefault: () => void }) {
  if (!isAndroidDevice() || !isHuaweiAppGalleryUrl(storeUrl)) {
    return;
  }

  event?.preventDefault();
  const fallback = encodeURIComponent(storeUrl);
  const parsed = new URL(storeUrl);
  const intentUrl = `intent://${parsed.host}${parsed.pathname}${parsed.search}${parsed.hash}#Intent;scheme=https;package=com.huawei.appmarket;S.browser_fallback_url=${fallback};end`;

  window.location.href = intentUrl;
  window.setTimeout(() => {
    if (document.visibilityState === "visible") {
      window.location.assign(storeUrl);
    }
  }, 1200);
}
