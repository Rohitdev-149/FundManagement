const mongoose = require("mongoose");

const contributionSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
      index: true,
    },
    contributorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Contributor",
      required: true,
      index: true,
    },
    amount: { type: Number, required: true, min: 0 },
    paymentMode: {
      type: String,
      enum: ["cash", "upi", "bank", "other"],
      required: true,
    },
    date: { type: Date, required: true, default: Date.now },
    referenceId: { type: String },
    note: { type: String },
    status: {
      type: String,
      enum: ["paid", "pending", "partial"],
      default: "paid",
    },
    expectedAmount: { type: Number, min: 0 },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Contribution", contributionSchema);
