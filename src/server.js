import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";
import cron from "node-cron";
import PushSubscriptionRepo from "./modules/push/infrastructure/PushSubscriptionRepo.js";
import PushService from "./modules/push/application/PushService.js";

const PORT = process.env.PORT || 5000;
const APP_URL = process.env.APP_URL || `http://localhost:${PORT}`;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Self-ping to prevent Render free tier cold start (every 10 min)
if (process.env.NODE_ENV === "production") {
  setInterval(async () => {
    try {
      await fetch(`${APP_URL}/health`);
    } catch {
      // silent — expected if Render is spinning down
    }
  }, 10 * 60 * 1000);
}

// Check for due/overdue reminders every hour and send push notifications
const pushRepo = new PushSubscriptionRepo();
const pushService = new PushService(pushRepo);

cron.schedule("0 * * * *", async () => {
  try {
    await pushService.checkAndSendDueReminders();
  } catch (err) {
    console.error("Push notification cron error:", err.message);
  }
});
