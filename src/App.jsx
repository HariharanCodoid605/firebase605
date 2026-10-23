
import { useEffect, useRef, useState } from "react";
import {
  onRegistered,
  onMessage,
  register,
} from "firebase/messaging";
import { messagingPromise } from "./firebase";
import "./App.css";

const VAPID_KEY =
  "BBXH-b2_UtNQGFpkIa9cLUyNheBnaCSimiQDj-l5r8wsnwNbShpT8UaUyJb8-yDMzZ_3MKFDlmI6fK4CDl5AEC0";

function App() {
  const [installationId, setInstallationId] = useState("");
  const [status, setStatus] = useState(
    "Your notifications are waiting to be enabled."
  );
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [toastVisible, setToastVisible] = useState(false);

  const unsubscribeRef = useRef(null);
  const registrationStartedRef = useRef(false);
  const toastTimerRef = useRef(null);
  const hideTimerRef = useRef(null);

  // Smoothly hide the animated notification.
  const dismissToast = () => {
    setToastVisible(false);

    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
    }

    hideTimerRef.current = setTimeout(() => {
      setToast(null);
    }, 350);
  };

  // Show a custom animated notification.
  const showToast = (title, body) => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }

    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
    }

    setToastVisible(false);

    // Allow the exit animation to finish before replacing content.
    hideTimerRef.current = setTimeout(() => {
      setToast({ title, body });
      setToastVisible(true);

      toastTimerRef.current = setTimeout(() => {
        setToastVisible(false);

        hideTimerRef.current = setTimeout(() => {
          setToast(null);
        }, 350);
      }, 5000);
    }, toast ? 350 : 0);
  };

  useEffect(() => {
    let unsubscribe;
    let cancelled = false;

    async function listenForMessages() {
      try {
        const messaging = await messagingPromise;

        if (!messaging || cancelled) return;

        unsubscribe = onMessage(messaging, (payload) => {
          console.log("Foreground push received:", payload);

          const title =
            payload.notification?.title || "New notification";

          const body =
            payload.notification?.body ||
            "You received a new message.";

          setStatus("A new notification has arrived.");
          showToast(title, body);

          // Avoid showing a duplicate native browser notification.
          // This custom toast is for when the website is in the foreground.
        });
      } catch (error) {
        console.error("Message listener error:", error);
      }
    }

    listenForMessages();

    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, []);

  useEffect(() => {
    return () => {
      unsubscribeRef.current?.();
      clearTimeout(toastTimerRef.current);
      clearTimeout(hideTimerRef.current);
    };
  }, []);

  const enableNotifications = async () => {
    if (loading) return;

    setLoading(true);

    try {
      if (!("Notification" in window)) {
        setStatus("Your browser does not support notifications.");
        return;
      }

      if (!("serviceWorker" in navigator)) {
        setStatus("Service workers are not supported.");
        return;
      }

      if (!window.isSecureContext) {
        setStatus("Please use HTTPS or localhost.");
        return;
      }

      setStatus("Requesting notification permission...");

      const permission = await Notification.requestPermission();

      if (permission !== "granted") {
        setStatus("Notification permission was not granted.");
        return;
      }

      setStatus("Registering service worker...");

      const serviceWorkerRegistration =
        await navigator.serviceWorker.register(
          "/firebase-messaging-sw.js"
        );

      await navigator.serviceWorker.ready;

      const messaging = await messagingPromise;

      if (!messaging) {
        setStatus(
          "Firebase Messaging is not supported in this browser."
        );
        return;
      }

      if (!registrationStartedRef.current) {
        unsubscribeRef.current = onRegistered(
          messaging,
          (id) => {
            setInstallationId(id);
            setStatus("Firebase successfully registered this browser.");
            console.log("Firebase Installation ID:", id);
          }
        );

        registrationStartedRef.current = true;
      }

      setStatus("Connecting to Firebase...");

      await register(messaging, {
        vapidKey: VAPID_KEY,
        serviceWorkerRegistration,
      });

      setStatus("Notifications enabled. Waiting for messages.");

      showToast(
        "Notifications enabled",
        "Your browser is ready to receive messages."
      );
    } catch (error) {
      console.error("Firebase Messaging error:", error);
      setStatus(`Error: ${error.message}`);

      showToast("Something went wrong", error.message);
    } finally {
      setLoading(false);
    }
  };

  const copyInstallationId = async () => {
    if (!installationId) return;

    try {
      await navigator.clipboard.writeText(installationId);
      setStatus("Installation ID copied successfully.");
      showToast("Copied successfully", "Installation ID copied.");
    } catch (error) {
      console.error("Copy error:", error);
      setStatus("Unable to copy. Please select the ID manually.");
    }
  };

  return (
    <main className="app">
      {/* Animated notification */}
      {toast && (
        <aside
          className={`notification-toast ${
            toastVisible ? "toast-visible" : "toast-hiding"
          }`}
          role="status"
          aria-live="polite"
        >
          <div className="toast-icon">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M10 21h4"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
              />
            </svg>
            <span className="toast-icon-dot" />
          </div>

          <div className="toast-content">
            <div className="toast-topline">
              <span className="toast-label">NEW NOTIFICATION</span>
              <span className="toast-live">
                <span />
                LIVE
              </span>
            </div>

            <h3>{toast.title}</h3>
            <p>{toast.body}</p>
          </div>

          <button
            type="button"
            className="toast-close"
            aria-label="Close notification"
            onClick={dismissToast}
          >
            &times;
          </button>

          <div
            key={`${toast.title}-${toast.body}`}
            className={`toast-progress ${
              toastVisible ? "progress-running" : ""
            }`}
          />
        </aside>
      )}

      <section className="card">
        <div className="hero-icon">
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M10 21h4"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </svg>
          <span className="hero-pulse" />
        </div>

        <div className="eyebrow">FIREBASE CLOUD MESSAGING</div>

        <h1>Push notifications</h1>

        <p className="subtitle">
          Stay connected with real-time notifications delivered
          directly to your browser.
        </p>

        <div className="connection-status">
          <span className="status-indicator" />
          <span>{status}</span>
        </div>

        <button
          type="button"
          className="enable-button"
          onClick={enableNotifications}
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="button-spinner" />
              Connecting...
            </>
          ) : (
            <>
              <span>Enable notifications</span>
              <span className="button-arrow">↗</span>
            </>
          )}
        </button>
//uwhruofhuorfr
        {installationId && (
          <section className="token-section">
            
             
            <textarea
              value={installationId}
              readOnly
              rows={3}
              aria-label="Firebase Installation ID"
            />

            <button
              type="button"
              className="copy-button"
              onClick={copyInstallationId}
            >
              Copy installation ID
            </button>

            <p className="helper-text">
              This is a Firebase Installation ID (FID), not an
              FCM registration token.
            </p>
          </section>
        )}

        <div className="bottom-note">
          <span className="shield-icon">✓</span>
          <span>Powered by Firebase · Browser notifications</span>
        </div>
      </section>
    </main>
  );
}

export default App;
