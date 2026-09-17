/**
 * Web Push Notification Service (TypeScript)
 * Pure Web Push Notification implementation
 */

import { getCurrentUser } from "./authService";

export const VAPID_PUBLIC_KEY =
  "BOMPQQn3bQc9vJt68WlanKbCfTpN-N2HLoTkB34G0348Cqoh1P1SD5wt4aK40fBG090yDkkAoCVBICK0IigZ07Y";

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/\-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function isPushNotificationSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

export function getNotificationPermissionStatus(): NotificationPermission | "unsupported" {
  if (!isPushNotificationSupported()) return "unsupported";
  return Notification.permission;
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!isPushNotificationSupported()) {
    throw new Error("Web Push Notification tidak didukung pada browser/perangkat ini.");
  }

  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    throw new Error("Izin notifikasi tidak diberikan oleh pengguna.");
  }

  return permission;
}

export async function subscribeUserToPush(): Promise<PushSubscription | null> {
  if (!isPushNotificationSupported()) return null;

  try {
    const perm = await requestNotificationPermission();
    if (perm !== "granted") return null;

    const registration = await navigator.serviceWorker.ready;
    let subscription = await registration.pushManager.getSubscription();

    if (!subscription) {
      const convertedVapidKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedVapidKey as unknown as BufferSource,
      });
    }

    if (subscription) {
      const user = getCurrentUser();
      const payload = {
        action: "subscribe",
        subscription: subscription.toJSON(),
        userId: user ? user.id : null,
        userEmail: user ? user.email : null,
      };

      const response = await fetch("/api/push-subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        (window as any).__sopaloka_push_enabled = true;
        console.log("[Web Push] Perangkat berhasil terdaftar untuk notifikasi push SOPALOKA.");
      }
      return subscription;
    }
  } catch (error) {
    console.error("[Web Push Subscribe Error]", error);
    throw error;
  }
  return null;
}

export async function unsubscribeUserFromPush(): Promise<boolean> {
  if (!isPushNotificationSupported()) return false;

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      await fetch("/api/push-subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "unsubscribe",
          subscription: subscription.toJSON(),
        }),
      });

      await subscription.unsubscribe();
      (window as any).__sopaloka_push_enabled = false;
      console.log("[Web Push] Perangkat berhasil berhenti berlangganan notifikasi push.");
      return true;
    }
  } catch (error) {
    console.error("[Web Push Unsubscribe Error]", error);
  }
  return false;
}

export async function sendPushBroadcast({
  title,
  body,
  url,
  tag,
  targetUserId,
  targetEmail,
}: {
  title?: string;
  body?: string;
  url?: string;
  tag?: string;
  targetUserId?: string;
  targetEmail?: string;
}): Promise<any> {
  try {
    const response = await fetch("/api/push-notify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: title || "📢 SOPALOKA — Jual Beli Barang Terdekat — Pantau Cocok Bayar",
        body: body || "Pembaruan sistem & info barang terbaru!",
        url: url || "https://solosatset.vercel.app/",
        tag: tag || "sopaloka-update",
        targetUserId,
        targetEmail,
      }),
    });
    return await response.json();
  } catch (e: any) {
    console.error("[Web Push Broadcast Error]", e);
    return { success: false, error: e.message };
  }
}

export async function initPushNotification(): Promise<void> {
  if (!isPushNotificationSupported()) return;

  if (Notification.permission === "granted") {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        const user = getCurrentUser();
        fetch("/api/push-subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "subscribe",
            subscription: subscription.toJSON(),
            userId: user ? user.id : null,
            userEmail: user ? user.email : null,
          }),
        }).catch(() => {});
      }
    } catch (_e) {}
  }
}

export function showPushNotificationBanner(): void {
  // Pure React architecture: UI prompts are handled by React components, not direct DOM manipulation.
}
