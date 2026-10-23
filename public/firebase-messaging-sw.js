

importScripts(
  "https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js"
);
/////uhfiurifhrof
firebase.initializeApp({
  apiKey: "BBXH-b2_UtNQGFpkIa9cLUyNheBnaCSimiQDj-l5r8wsnwNbShpT8UaUyJb8-yDMzZ_3MKFDlmI6fK4CDl5AEC0",
  authDomain: "learnfirebase9837.firebaseapp.com",
  projectId: "learnfirebase9837",
  storageBucket: "learnfirebase9837.firebasestorage.app",
  messagingSenderId: "93445621267",
  appId: "1:93445621267:web:8af443cd87cbf6e05761e6",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const title =
    payload.notification?.title || "Firebase Notification";

  const options = {
    body: payload.notification?.body || "You have a new message.",
  };

  self.registration.showNotification(title, options);
});