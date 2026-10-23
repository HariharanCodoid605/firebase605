
require("dotenv").config({ override: true });

const express = require("express");
const { initializeApp, cert } = require("firebase-admin/app");
const { getMessaging } = require("firebase-admin/messaging");
//khbukbukrbufbrbfr
const app = express();

app.use(express.json({ limit: "10kb" }));

const PROJECT_ID = "learnfirebase9837";
const PORT = 3001;

// Load the service-account JSON path from server/.env
const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;

if (!credentialsPath) {
  throw new Error(
    "GOOGLE_APPLICATION_CREDENTIALS is missing from server/.env"
  );
}

const serviceAccount = require(credentialsPath);

if (serviceAccount.project_id !== PROJECT_ID) {
  throw new Error(
    `Service-account project ID must be ${PROJECT_ID}`
  );
}

// Initialize Firebase Admin
initializeApp({
  credential: cert(serviceAccount),
  projectId: PROJECT_ID,
});

// Test endpoint
app.get("/", (req, res) => {
  res.send("Firebase notification server is running.");
});

// Send notification
app.post("/send-notification", async (req, res) => {
  try {
    const { title, body, fcmToken } = req.body;

    // Validate request data
    if (
      typeof title !== "string" ||
      typeof body !== "string" ||
      typeof fcmToken !== "string" ||
      !title.trim() ||
      !body.trim() ||
      !fcmToken.trim()
    ) {
      return res.status(400).json({
        success: false,
        error: "Provide title, body, and fcmToken.",
      });
    }

    // Send using Firebase Cloud Messaging
const messageId = await getMessaging().send({
      token: fcmToken.trim(),
      notification: {
        title: title.trim(),
        body: body.trim(),
      },
      webpush: {
        notification: {
          title: title.trim(),
          body: body.trim(),
          icon: "/firebase-logo.png",
        },
      },
    });

    return res.status(200).json({
      success: true,
      message: "Firebase accepted the notification.",
      messageId,
    });
  } catch (error) {
    console.error("Send notification error:", error);

    return res.status(500).json({
      success: false,
      error: error.message || "Failed to send notification.",
      code: error.code || null,
    });
  }
});

// Start local development server
app.listen(PORT, "127.0.0.1", () => {
  console.log(
    `Notification server running at http://127.0.0.1:${PORT}`
  );
});
