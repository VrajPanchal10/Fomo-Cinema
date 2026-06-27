/**
 * migrateShows.js
 *
 * Manual migration script – run once to clean up legacy Show documents.
 *
 * Usage:
 *   npm run migrate:shows
 *
 * What it does:
 *   1. Finds all Show documents that still contain legacy fields
 *      (date, time, weekday, showDate, showTime stored as persisted paths).
 *   2. If a document has date + time but no showDateTime, constructs
 *      showDateTime from them.
 *   3. Removes the legacy fields using $unset.
 *   4. Reports a summary.
 *
 * Idempotent – safe to run multiple times.
 */

const path = require("path");
const dotenv = require("dotenv");
dotenv.config({ path: path.join(__dirname, "../.env") });

const mongoose = require("mongoose");
const connectDB = require("../src/config/db");

// IST offset helper (mirrors the Show model's toIST)
const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

async function migrateShows() {
  await connectDB();
  console.log("\n🔄  Starting Show migration...\n");

  const db = mongoose.connection.db;
  const showsCol = db.collection("shows");

  // ── Step 1: Fix documents with legacy date + time but no showDateTime ──────
  const legacyDocs = await showsCol
    .find({
      $or: [
        { date: { $exists: true } },
        { time: { $exists: true } },
        { weekday: { $exists: true } },
        // These would only be present as persisted paths on old schemas
        { showDate: { $exists: true, $type: "string" } },
        { showTime: { $exists: true, $type: "string" } },
      ],
    })
    .toArray();

  console.log(`Found ${legacyDocs.length} document(s) with legacy fields.\n`);

  let fixed = 0;
  let skipped = 0;

  for (const doc of legacyDocs) {
    const updateOp = { $unset: {} };
    let needsUpdate = false;

    // Build showDateTime from legacy date + time if missing
    if (!doc.showDateTime && doc.date && doc.time) {
      try {
        // date might be "YYYY-MM-DD" or a Date object; time is "HH:MM"
        const dateStr = doc.date instanceof Date
          ? doc.date.toISOString().split("T")[0]
          : String(doc.date).split("T")[0];
        const [hh, mm] = String(doc.time).split(":").map(Number);

        // Parse as IST then convert to UTC for storage
        const istMs = new Date(`${dateStr}T00:00:00.000Z`).getTime();
        const showDateTime = new Date(istMs - IST_OFFSET_MS + hh * 3600000 + mm * 60000);

        await showsCol.updateOne(
          { _id: doc._id },
          { $set: { showDateTime } }
        );
        console.log(`  ✓ Set showDateTime for show ${doc._id} → ${showDateTime.toISOString()}`);
        needsUpdate = true;
      } catch (err) {
        console.warn(`  ⚠ Could not build showDateTime for show ${doc._id}: ${err.message}`);
        skipped++;
        continue;
      }
    }

    // Mark legacy fields for removal
    const fieldsToUnset = ["date", "time", "weekday"];
    // Only unset persisted showDate / showTime strings (not virtuals)
    if (typeof doc.showDate === "string") fieldsToUnset.push("showDate");
    if (typeof doc.showTime === "string") fieldsToUnset.push("showTime");

    for (const f of fieldsToUnset) {
      if (f in doc) {
        updateOp.$unset[f] = "";
        needsUpdate = true;
      }
    }

    if (needsUpdate && Object.keys(updateOp.$unset).length > 0) {
      await showsCol.updateOne({ _id: doc._id }, updateOp);
      console.log(`  ✓ Unset legacy fields [${Object.keys(updateOp.$unset).join(", ")}] on show ${doc._id}`);
      fixed++;
    }
  }

  // ── Step 2: Migrate legacy Booking snapshots ──────────────────────────────
  const bookingsCol = db.collection("bookings");

  // Old bookings may have showDate (string) + showTime (string) but not snapshotShowDateTime
  const legacyBookings = await bookingsCol
    .find({
      snapshotShowDateTime: { $exists: false },
      $or: [
        { showDate: { $exists: true } },
        { showTime: { $exists: true } },
      ],
    })
    .toArray();

  console.log(`\nFound ${legacyBookings.length} booking(s) with legacy snapshot fields.\n`);

  let bookingsFixed = 0;
  for (const bk of legacyBookings) {
    const setFields = {};

    // Rename showDate → showDateLabel
    if (bk.showDate && !bk.showDateLabel) {
      setFields.showDateLabel = bk.showDate;
    }
    // Rename showTime → showTimeLabel
    if (bk.showTime && !bk.showTimeLabel) {
      setFields.showTimeLabel = bk.showTime;
    }

    if (Object.keys(setFields).length > 0) {
      await bookingsCol.updateOne(
        { _id: bk._id },
        {
          $set: setFields,
          $unset: { showDate: "", showTime: "" },
        }
      );
      bookingsFixed++;
    }
  }

  console.log(`  ✓ Migrated ${bookingsFixed} booking snapshot(s).\n`);

  // ── Done ──────────────────────────────────────────────────────────────────
  console.log("─────────────────────────────────────────");
  console.log(`Show migration complete.`);
  console.log(`  Shows fixed  : ${fixed}`);
  console.log(`  Shows skipped: ${skipped}`);
  console.log(`  Bookings migrated: ${bookingsFixed}`);
  console.log("─────────────────────────────────────────\n");

  await mongoose.disconnect();
  process.exit(0);
}

migrateShows().catch((err) => {
  console.error("Migration failed:", err.message);
  process.exit(1);
});
