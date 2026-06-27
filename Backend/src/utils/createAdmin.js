/**
 * createAdmin.js — Idempotent admin account creation script.
 *
 * Usage:  npm run create:admin
 *
 * Reads credentials from .env:
 *   ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_PHONE
 *
 * Behaviour:
 *   - If an admin account with that email already exists → do nothing.
 *   - If a regular user with that email exists → elevate to admin.
 *   - If no account exists → create one with role = "admin".
 *
 * Safe to run multiple times (idempotent).
 * No credentials are hardcoded.
 */

"use strict";

const path = require("path");
const dotenv = require("dotenv");

// ── 1. Load .env BEFORE importing anything that reads process.env ────────────
dotenv.config({ path: path.join(__dirname, "../../.env") });
console.log("\n===== ENV CHECK =====");
console.log("ENV PATH:", path.join(__dirname, "../../.env"));
console.log("MONGODB_URI:", process.env.MONGODB_URI ? "Loaded ✅" : "Missing ❌");
console.log("ADMIN_EMAIL:", process.env.ADMIN_EMAIL);
console.log("JWT_SECRET:", process.env.JWT_SECRET ? "Loaded ✅" : "Missing ❌");
console.log("=====================\n");

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const connectDB = require("../config/db");

// ── 2. Read credentials from env ─────────────────────────────────────────────
const adminName     = (process.env.ADMIN_NAME     || "").trim();
const adminEmail    = (process.env.ADMIN_EMAIL     || "").toLowerCase().trim();
const adminPassword = (process.env.ADMIN_PASSWORD  || "").trim();
const adminPhone    = (process.env.ADMIN_PHONE     || "").trim();

const REQUIRED = { ADMIN_NAME: adminName, ADMIN_EMAIL: adminEmail, ADMIN_PASSWORD: adminPassword, ADMIN_PHONE: adminPhone };
const missing  = Object.entries(REQUIRED).filter(([, v]) => !v).map(([k]) => k);

if (missing.length) {
  console.error("✖  Missing required .env variables:", missing.join(", "));
  process.exit(1);
}

// ── 3. Main logic ─────────────────────────────────────────────────────────────
const run = async () => {
  console.log("Connecting to MongoDB...");
  await connectDB();

  try {
    const existing = await User.findOne({ email: adminEmail });

    // ── Case A: admin already exists and already has the right role ──────────
    if (existing && existing.role === "admin") {
      console.log(`\n✔  Admin account already exists.\n   Email : ${adminEmail}\n   Role  : admin\n   ID    : ${existing._id}\n\nNo changes made.\n`);
      return;
    }

    const hashedPassword = await bcrypt.hash(adminPassword, 12);

    // ── Case B: account exists but role is wrong — elevate it ────────────────
    if (existing) {
      await User.updateOne(
        { _id: existing._id },
        {
          $set: {
            role:     "admin",
            password: hashedPassword,
            name:     adminName,
            phone:    adminPhone,
          },
        }
      );
      console.log(`\n✔  Existing account elevated to admin.\n   Email : ${adminEmail}\n   Role  : admin\n   ID    : ${existing._id}\n`);
    } else {
      // ── Case C: no account → create one with role = "admin" ─────────────────
      const adminUser = await User.create({
        name:     adminName,
        email:    adminEmail,
        password: hashedPassword,
        phone:    adminPhone,
        role:     "admin",          // ← explicit — never relies on schema default
      });
      console.log(`\n✔  Admin account created successfully.\n   Email : ${adminEmail}\n   Role  : admin\n   ID    : ${adminUser._id}\n`);
    }

    // ── 4. Verify the document in MongoDB ────────────────────────────────────
    const verified = await User.findOne({ email: adminEmail }).lean();
    if (!verified || verified.role !== "admin") {
      console.error("✖  Verification failed — role is not 'admin' in MongoDB.");
      process.exit(1);
    }
    console.log("✔  MongoDB verification passed — role = \"admin\".");

    // ── 5. Verify JWT carries the correct role ────────────────────────────────
    const token = jwt.sign(
      { id: verified._id, email: verified.email, role: verified.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== "admin") {
      console.error("✖  JWT verification failed — role payload is not 'admin'.");
      process.exit(1);
    }
    console.log("✔  JWT verification passed  — role = \"admin\" in token payload.");

    console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("  Admin account is ready. You can log in now.");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  } catch (err) {
    console.error("✖  Error during admin creation:", err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
};

run();
