const cron = require("node-cron");
const UserModel = require("../models/User.model.js");
const _db = require("../utils/db.js");

  await _db(); // ensure DB is connected before running

const checkExpiredCourses = async () => {


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

// Run daily at midnight
cron.schedule("0 0 * * *", checkExpiredCourses);
