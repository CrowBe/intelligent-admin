// Firebase messaging service worker (Static fallback)
// Note: This is a fallback file. The dynamic service worker with environment variables
// is preferred and will be registered programmatically from the main app.

importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Initialize Firebase in service worker
// These values will be replaced by the dynamic service worker in production
const firebaseConfig = {
  apiKey: 'AIzaSyDXDoj4ITnxuqahEEPi91xbmCsH3fhAMlw',
  authDomain: 'intelligent-admin.firebaseapp.com',
  projectId: 'intelligent-admin',
  storageBucket: 'intelligent-admin.firebasestorage.app',
  messagingSenderId: '449025553834',
  appId: '1:449025553834:web:8f352bd9b0820715f8e7d3',
};

firebase.initializeApp(firebaseConfig);

// Get messaging instance
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage(payload => {
  console.log('Received background message: ', payload);

  const notificationTitle = payload.notification?.title || 'Intelligent Admin';
  const notificationOptions = {
    body: payload.notification?.body || 'You have a new notification',
    icon: '/intelligent-admin-logo-1.png',
    badge: '/intelligent-admin-logo-1.png',
    tag: payload.data?.type || 'general',
    requireInteraction: payload.data?.type === 'urgent_email',
    data: payload.data || {},
    actions: []
  };

  // Add contextual actions based on notification type
  if (payload.data?.type === 'morning_brief') {
    notificationOptions.actions = [
      {
        action: 'view_brief',
        title: '📋 View Brief'
      },
      {
        action: 'dismiss',
        title: 'Later'
      }
    ];
  } else if (payload.data?.type === 'urgent_email') {
    notificationOptions.actions = [
      {
        action: 'open_email',
        title: '📧 Reply'
      },
      {
        action: 'dismiss',
        title: 'Later'
      }
    ];
    notificationOptions.requireInteraction = true; // Keep urgent emails visible
  } else {
    notificationOptions.actions = [
      {
        action: 'open',
        title: 'Open App'
      },
      {
        action: 'dismiss',
        title: 'Dismiss'
      }
    ];
  }

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', event => {
  console.log('Notification clicked: ', event);

  event.notification.close();

  const action = event.action;
  const data = event.notification.data || {};

  // Handle different actions
  let urlToOpen = '/dashboard';
  
  if (action === 'view_brief' || data.type === 'morning_brief') {
    urlToOpen = '/dashboard?tab=morning-brief';
  } else if (action === 'open_email' || data.type === 'urgent_email') {
    urlToOpen = '/dashboard?tab=emails&focus=urgent';
  } else if (data.type === 'calendar_conflict') {
    urlToOpen = '/dashboard?tab=calendar';
  } else if (action === 'dismiss') {
    // Just close, don't open app
    return;
  }

  // Open/focus the app
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      // Check if app is already open
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          // Focus existing window and navigate
          client.focus();
          client.postMessage({
            type: 'NOTIFICATION_CLICK',
            action: action,
            data: data,
            url: urlToOpen
          });
          return;
        }
      }
      
      // Open new window
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// Handle notification close
self.addEventListener('notificationclose', event => {
  console.log('Notification closed: ', event);
  
  // Track notification dismissal for analytics
  const data = event.notification.data || {};
  
  if (data.type) {
    fetch('/api/v1/notifications/dismissed', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: data.type,
        timestamp: new Date().toISOString()
      })
    }).catch(err => console.log('Failed to track notification dismissal:', err));
  }
});
