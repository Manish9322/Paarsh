import { useState, useEffect } from 'react';
import { useSubscribePushNotificationsMutation } from '@/services/api';

const PushNotificationSetup = () => {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [permission, setPermission] = useState('default');

  const [subscribePushNotifications] = useSubscribePushNotificationsMutation();

  useEffect(() => {
    const checkSupport = () => {
      const supported = 'serviceWorker' in navigator && 'PushManager' in window;
      setIsSupported(supported);

      if (supported) {
        setPermission(Notification.permission);
        checkSubscriptionStatus();
      }
    };

    checkSupport();
  }, []);

  const checkSubscriptionStatus = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      setIsSubscribed(!!subscription);
    } catch (error) {
      console.error('Error checking subscription status:', error);
    }
  };

  const subscribe = async () => {
    if (!isSupported) return;

    setLoading(true);
    try {
      const permission = await Notification.requestPermission();
      setPermission(permission);

      if (permission !== 'granted') {
        alert('Push notifications permission denied');
        return;
      }

      const registration = await navigator.serviceWorker.register('/sw.js');
      await navigator.serviceWorker.ready;

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY),
      });

      await subscribePushNotifications(subscription).unwrap();
      setIsSubscribed(true);
      console.log('Push notification subscription successful');
    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
      alert('Failed to subscribe to push notifications');
    } finally {
      setLoading(false);
    }
  };

  const unsubscribe = async () => {
    setLoading(true);
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        await subscription.unsubscribe();
      }

      // Note: The provided RTK Query setup doesn't include an unsubscribe endpoint.
      // If one exists, you would use a similar mutation here.
      setIsSubscribed(false);
      console.log('Push notification unsubscription successful');
    } catch (error) {
      console.error('Error unsubscribing from push notifications:', error);
      alert('Failed to unsubscribe from push notifications');
    } finally {
      setLoading(false);
    }
  };

  const urlBase64ToUint8Array = (base64String) => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  if (!isSupported) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">
              Push notifications not supported
            </h3>
            <p className="mt-1 text-sm text-yellow-700">
              Your browser does not support push notifications.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Push Notifications</h3>
          <p className="mt-1 text-sm text-gray-600">
            Get notified even when you are not on the site
          </p>
        </div>
        <div className="flex items-center">
          {permission === 'denied' ? (
            <div className="text-sm text-red-600">
              Permission denied. Please enable in browser settings.
            </div>
          ) : (
            <button
              onClick={isSubscribed ? unsubscribe : subscribe}
              disabled={loading}
              className={`px-4 py-2 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 ${
                isSubscribed
                  ? 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'
                  : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500'
              }`}
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Loading...
                </div>
              ) : isSubscribed ? (
                'Disable Notifications'
              ) : (
                'Enable Notifications'
              )}
            </button>
          )}
        </div>
      </div>
      <div className="mt-4 flex items-center">
        <div
          className={`w-2 h-2 rounded-full mr-2 ${isSubscribed ? 'bg-green-500' : 'bg-gray-300'}`}
        ></div>
        <span className="text-sm text-gray-600">
          Push notifications are {isSubscribed ? 'enabled' : 'disabled'}
        </span>
      </div>
    </div>
  );
};

export default PushNotificationSetup;