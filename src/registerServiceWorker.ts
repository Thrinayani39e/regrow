// Registered after load so it never competes with the app's own initial
// render for bandwidth/main-thread time. import.meta.env.BASE_URL keeps
// this correct whether the app is served from a domain root or, as on
// GitHub Pages, a /regrow/ subpath.
export function registerServiceWorker(): void {
  if (!('serviceWorker' in navigator)) return;
  window.addEventListener('load', () => {
    navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).catch(() => {
      // Installability/offline support is a nice-to-have here, not a
      // requirement — a failed registration shouldn't be user-visible.
    });
  });
}
