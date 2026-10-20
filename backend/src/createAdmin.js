
require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");

async function createAdmin() {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is missing in backend/.env");
    }

    await mongoose.connect(process.env.MONGO_URI);

    const email = "admin@shopease.com";
    const password = "123456";

    let user = await User.findOne({ email });

    if (user) {
      user.name = "ShopEase Admin";
      user.password = await bcrypt.hash(password, 12);
      user.role = "admin";
      await user.save();
    } else {
      user = await User.create({
        name: "ShopEase Admin",
        email,
        password: await bcrypt.hash(password, 12),
        role: "admin",
      });
    }

    console.log("Admin account created/updated successfully.");
    console.log("Email:", email);
    console.log("Role:", user.role);
  } catch (error) {
    console.error("Admin setup failed:", error.message);
  } finally {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  }
}

createAdmin();
