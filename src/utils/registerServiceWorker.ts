// File: src/utils/registerServiceWorker.ts
export function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('Service Worker registered: ', registration);

          // Request notification permission
          if ('Notification' in window) {
            Notification.requestPermission().then((permission) => {
              if (permission === 'granted') {
                console.log('Notification permission granted.');
              } else {
                console.log('Notification permission denied.');
              }
            });
          }
        })
        .catch((error) => {
          console.error('Service Worker registration failed: ', error);
        });
    });
  }
}