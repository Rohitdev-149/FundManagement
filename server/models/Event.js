const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    dbName: { type: String, unique: true, sparse: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date },
    totalBudget: { type: Number, default: 0, min: 0 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Event", eventSchema);
