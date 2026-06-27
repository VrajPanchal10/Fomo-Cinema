const mongoose = require("mongoose");

const defaultSeatConfiguration = [
  {
    row: "A",
    type: "standard",
    seats: [
      { type: "seat", num: 1 },
      { type: "seat", num: 2 },
      { type: "seat", num: 3 },
      { type: "empty" },
      { type: "spacer" },
      { type: "seat", num: 4 },
      { type: "seat", num: 5 },
      { type: "seat", num: 6 },
      { type: "seat", num: 7 },
      { type: "empty" },
    ],
  },
  {
    row: "B",
    type: "standard",
    seats: [
      { type: "seat", num: 1 },
      { type: "seat", num: 2 },
      { type: "seat", num: 3 },
      { type: "seat", num: 4 },
      { type: "spacer" },
      { type: "seat", num: 5 },
      { type: "seat", num: 6 },
      { type: "seat", num: 7 },
      { type: "seat", num: 8 },
      { type: "seat", num: 9 },
    ],
  },
  {
    row: "C",
    type: "recliner",
    seats: [
      { type: "seat", num: 1 },
      { type: "seat", num: 2 },
      { type: "seat", num: 3 },
      { type: "seat", num: 4 },
      { type: "spacer" },
      { type: "seat", num: 5 },
      { type: "seat", num: 6 },
      { type: "seat", num: 7 },
      { type: "seat", num: 8 },
      { type: "seat", num: 9 },
    ],
  },
  {
    row: "D",
    type: "recliner",
    seats: [
      { type: "seat", num: 1 },
      { type: "seat", num: 2 },
      { type: "seat", num: 3 },
      { type: "seat", num: 4 },
      { type: "spacer" },
      { type: "seat", num: 5 },
      { type: "seat", num: 6 },
      { type: "seat", num: 7 },
      { type: "seat", num: 8 },
      { type: "seat", num: 9 },
    ],
  },
  {
    row: "E",
    type: "share",
    seats: [
      { type: "seat", num: 1 },
      { type: "seat", num: 2 },
      { type: "seat", num: 3 },
      { type: "seat", num: 4 },
      { type: "spacer" },
      { type: "seat", num: 5 },
      { type: "seat", num: 6 },
      { type: "seat", num: 7 },
      { type: "seat", num: 8 },
      { type: "empty" },
    ],
  },
  {
    row: "F",
    type: "share",
    seats: [
      { type: "empty" },
      { type: "empty" },
      { type: "empty" },
      { type: "empty" },
      { type: "seat", num: 1 },
      { type: "seat", num: 2 },
      { type: "empty" },
      { type: "empty" },
      { type: "empty" },
      { type: "empty" },
    ],
  },
];

// ─── Timezone utility (IST = UTC+5:30) ───────────────────────────────────────
// Derive display strings from showDateTime WITHOUT storing duplicate fields.
const toIST = (date) => {
  // Returns a Date object representing the same instant shifted to IST
  const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
  return new Date(date.getTime() + IST_OFFSET_MS);
};

// ─── Schema ──────────────────────────────────────────────────────────────────
const showSchema = new mongoose.Schema(
  {
    movie: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Movie",
      required: true,
    },
    // Single source of truth – stored as UTC
    showDateTime: {
      type: Date,
      required: true,
      index: true,
    },
    ticketPrice: {
      type: Number,
      required: true,
      default: 15.0,
    },
    screenName: {
      type: String,
      required: true,
      default: "Screen 1",
    },
    totalSeats: {
      type: Number,
      required: true,
      default: 44,
    },
    bookedSeats: [{ type: String }],
    seatConfiguration: {
      type: mongoose.Schema.Types.Mixed,
      default: defaultSeatConfiguration,
    },
    status: {
      type: String,
      enum: ["Scheduled", "Active", "Cancelled", "Sold Out", "Completed", "Archived"],
      default: "Active",
      index: true,
    },
  },
  {
    timestamps: true,
    // Expose virtuals in JSON and plain object serialisation
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Unique index ─────────────────────────────────────────────────────────────
showSchema.index({ showDateTime: 1, screenName: 1 }, { unique: true });
showSchema.index({ movie: 1 });

// ─── Virtuals ────────────────────────────────────────────────────────────────
// showDate → "2026-06-27"  (IST local date)
showSchema.virtual("showDate").get(function () {
  if (!this.showDateTime) return null;
  const ist = toIST(this.showDateTime);
  const yyyy = ist.getUTCFullYear();
  const mm = String(ist.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(ist.getUTCDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
});

// showTime → "14:30"  (IST local time, 24-hour HH:MM)
showSchema.virtual("showTime").get(function () {
  if (!this.showDateTime) return null;
  const ist = toIST(this.showDateTime);
  const hh = String(ist.getUTCHours()).padStart(2, "0");
  const min = String(ist.getUTCMinutes()).padStart(2, "0");
  return `${hh}:${min}`;
});

// weekday → "Thursday"  (IST local weekday name)
showSchema.virtual("weekday").get(function () {
  if (!this.showDateTime) return null;
  const ist = toIST(this.showDateTime);
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  return days[ist.getUTCDay()];
});

module.exports = mongoose.model("Show", showSchema);
