const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
      index: true,
    },
    name: { type: String, required: true },
    icon: { type: String, default: "\u{1F4E6}" },
    budget: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true },
);

module.exports = mongoose.model("ExpenseCategory", categorySchema);
