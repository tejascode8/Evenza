const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, ".env") });

if (process.env.NODE_ENV !== "production") {
  const dns = require("dns");
  dns.setServers(["1.1.1.1", "8.8.8.8"]);
}

const User = require("./models/User");

const seedAdmin = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/evenza";
    console.log("Connecting to database...");
    await mongoose.connect(mongoUri);
    console.log("MongoDB Connected.");

    const adminEmail = "admin@evenza.com";
    const defaultPassword = "Admin@12345";
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(defaultPassword, salt);

    let admin = await User.findOne({ email: adminEmail });
    if (admin) {
      admin.name = "Evenza Admin";
      admin.password = hashedPassword;
      admin.role = "admin";
      admin.isVerified = true;
      await admin.save();
      console.log("\n=======================================================");
      console.log("SUCCESS: Existing Admin account has been reset & verified!");
      console.log(`Email    : ${adminEmail}`);
      console.log(`Password : ${defaultPassword}`);
      console.log(`Role     : admin`);
      console.log("=======================================================\n");
    } else {
      admin = await User.create({
        name: "Evenza Admin",
        email: adminEmail,
        password: hashedPassword,
        role: "admin",
        isVerified: true
      });
      console.log("\n=======================================================");
      console.log("SUCCESS: New Admin account created & verified!");
      console.log(`Email    : ${adminEmail}`);
      console.log(`Password : ${defaultPassword}`);
      console.log(`Role     : admin`);
      console.log("=======================================================\n");
    }

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("Error creating/resetting admin:", error.message);
    process.exit(1);
  }
};

seedAdmin();
