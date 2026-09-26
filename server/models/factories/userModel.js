const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ["admin", "treasurer", "viewer"],
      default: "viewer",
    },
    assignedEventId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
  },
  { timestamps: true },
);

userSchema.index({ phone: 1 }, { unique: true });

module.exports = (connection) =>
  connection.models.User || connection.model("User", userSchema);
