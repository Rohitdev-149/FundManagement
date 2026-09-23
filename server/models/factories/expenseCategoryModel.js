const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    icon: { type: String, default: "\u{1F4E6}" },
    budget: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true },
);

module.exports = (connection) =>
  connection.models.ExpenseCategory ||
  connection.model("ExpenseCategory", schema);
