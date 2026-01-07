export function generateDeviceFingerprint(): string {
  const navigator = window.navigator;
  const screen = window.screen;

  const components = [
    navigator.userAgent,
    navigator.language,
    screen.colorDepth,
    screen.width,
    screen.height,
    new Date().getTimezoneOffset(),
    navigator.platform,
    navigator.hardwareConcurrency || 'unknown',
  ];

  const fingerprint = components.join('|');
  return btoa(fingerprint);
}
