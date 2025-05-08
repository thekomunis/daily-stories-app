import CONFIG from "../config.js";

// Function to check if push notifications are supported
const isPushNotificationSupported = () => {
  return "serviceWorker" in navigator && "PushManager" in window;
};

// Function to request notification permission
const requestNotificationPermission = async () => {
  if (!isPushNotificationSupported()) {
    return { error: true, message: "Push notifications not supported" };
  }

  try {
    const permission = await Notification.requestPermission();
    return { error: false, permission };
  } catch (error) {
    console.error("Error requesting notification permission:", error);
    return { error: true, message: error.message };
  }
};

// Function to convert base64 string to Uint8Array
const urlBase64ToUint8Array = (base64String) => {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

// Function to send subscription to server
const sendSubscriptionToServer = async (subscription) => {
  try {
    const token = localStorage.getItem("userToken");
    if (!token) {
      return { error: true, message: "User not logged in" };
    }

    const response = await fetch(
      `${CONFIG.BASE_API_URL}/notifications/subscribe`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          endpoint: subscription.endpoint,
          keys: {
            p256dh: btoa(
              String.fromCharCode.apply(
                null,
                new Uint8Array(subscription.getKey("p256dh"))
              )
            ),
            auth: btoa(
              String.fromCharCode.apply(
                null,
                new Uint8Array(subscription.getKey("auth"))
              )
            ),
          },
        }),
      }
    );

    const responseData = await response.json();
    return responseData;
  } catch (error) {
    console.error("Error sending subscription to server:", error);
    return { error: true, message: error.message };
  }
};

// Function to remove subscription from server
const removeSubscriptionFromServer = async (subscription) => {
  try {
    const token = localStorage.getItem("userToken");
    if (!token) {
      return { error: true, message: "User not logged in" };
    }

    const response = await fetch(
      `${CONFIG.BASE_API_URL}/notifications/subscribe`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          endpoint: subscription.endpoint,
        }),
      }
    );

    const responseData = await response.json();
    return responseData;
  } catch (error) {
    console.error("Error removing subscription from server:", error);
    return { error: true, message: error.message };
  }
};

// Function to subscribe to push notification
const subscribeToPushNotification = async () => {
  try {
    // Check if push notification is supported
    if (!isPushNotificationSupported()) {
      return { error: true, message: "Push notifications not supported" };
    }

    // Request permission
    const permissionResult = await requestNotificationPermission();
    if (permissionResult.error || permissionResult.permission !== "granted") {
      return {
        error: true,
        message: "Notification permission denied or error occurred",
      };
    }

    // Get service worker registration
    const registration = await navigator.serviceWorker.ready;

    // Check existing subscription
    let subscription = await registration.pushManager.getSubscription();

    // If already subscribed, return the subscription
    if (subscription) {
      return {
        error: false,
        message: "Already subscribed to push notifications",
        subscription,
      };
    }

    // Convert VAPID key to Uint8Array
    const vapidPublicKey = CONFIG.VAPID_PUBLIC_KEY;
    const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);

    // Create a new subscription
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: convertedVapidKey,
    });

    // Send the subscription to the server
    const serverResponse = await sendSubscriptionToServer(subscription);

    if (serverResponse.error) {
      // If there was an error sending to server, unsubscribe locally
      await subscription.unsubscribe();
      return {
        error: true,
        message: serverResponse.message || "Failed to subscribe on server",
      };
    }

    return {
      error: false,
      message: "Successfully subscribed to push notifications",
      subscription,
      serverData: serverResponse.data,
    };
  } catch (error) {
    console.error("Error subscribing to push notification:", error);
    return { error: true, message: error.message };
  }
};

// Function to unsubscribe from push notification
const unsubscribeFromPushNotification = async () => {
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (!subscription) {
      return { error: false, message: "Not subscribed to push notifications" };
    }

    // Remove subscription from server first
    const serverResponse = await removeSubscriptionFromServer(subscription);

    // Unsubscribe locally regardless of server response
    await subscription.unsubscribe();

    if (serverResponse.error) {
      return {
        error: true,
        message:
          serverResponse.message ||
          "Error unsubscribing from server, but unsubscribed locally",
      };
    }

    return {
      error: false,
      message: "Successfully unsubscribed from push notifications",
    };
  } catch (error) {
    console.error("Error unsubscribing from push notification:", error);
    return { error: true, message: error.message };
  }
};

// Check if the user is currently subscribed to push notifications
const checkSubscription = async () => {
  try {
    if (!isPushNotificationSupported()) {
      return { error: true, message: "Push notifications not supported" };
    }

    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    return {
      error: false,
      isSubscribed: !!subscription,
      subscription,
    };
  } catch (error) {
    console.error("Error checking push notification subscription:", error);
    return { error: true, message: error.message };
  }
};

export {
  isPushNotificationSupported,
  requestNotificationPermission,
  subscribeToPushNotification,
  unsubscribeFromPushNotification,
  checkSubscription,
};
