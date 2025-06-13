import cron from "node-cron";
import UserModel from "../models/User.model.js";
import _db from "../utils/db.js";

const checkExpiredCourses = async () => {
  await _db(); // ensure DB is connected before running

  const now = new Date();
  const users = await UserModel.find();

  for (const user of users) {
    let updated = false;

    user.purchasedCourses.forEach((entry) => {
      if (!entry.isExpired && new Date(entry.expiryDate) < now) {
        entry.isExpired = true;
        updated = true;
      }
    });

    if (updated) await user.save();
  }

  console.log("✅ Checked and updated expired courses");
};

// Run immediately
checkExpiredCourses();

// Schedule to run daily at midnight
cron.schedule("0 0 * * *", checkExpiredCourses);
