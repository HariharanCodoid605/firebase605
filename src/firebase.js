
import { initializeApp } from "firebase/app";
import {
  getMessaging,
  isSupported,
} from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyD8SuMhUTfPXa6sMoKENunl5eRRmC5i5xc",
  authDomain: "learnfirebase9837.firebaseapp.com",
  projectId: "learnfirebase9837",
  storageBucket: "learnfirebase9837.firebasestorage.app",
  messagingSenderId: "93445621267",
  appId: "1:93445621267:web:8af443cd87cbf6e05761e6",
  measurementId: "G-419WHF54JH",
};

const app = initializeApp(firebaseConfig);

export const messagingPromise = isSupported().then(
  (supported) => {
    return supported ? getMessaging(app) : null;
  }
);

export default app;
