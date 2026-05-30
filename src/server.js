import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";
import cron from "node-cron";
import PushSubscriptionRepo from "./modules/push/infrastructure/PushSubscriptionRepo.js";
import PushService from "./modules/push/application/PushService.js";

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

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
