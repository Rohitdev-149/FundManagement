const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
      index: true,
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ExpenseCategory",
      required: true,
      index: true,
    },
    name: { type: String, required: true },
    amount: { type: Number, required: true, min: 0 },
    vendor: { type: String },
    paymentMode: {
      type: String,
      enum: ["cash", "upi", "bank", "other"],
      required: true,
    },
    date: { type: Date, required: true, default: Date.now },
    note: { type: String },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Expense", expenseSchema);
