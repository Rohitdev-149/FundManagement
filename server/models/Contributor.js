const mongoose = require("mongoose");

const contributorSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
      index: true,
    },
    name: { type: String, required: true },
    phone: { type: String },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Contributor", contributorSchema);
