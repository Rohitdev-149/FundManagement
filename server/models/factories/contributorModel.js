const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    phone: { type: String },
  },
  { timestamps: true },
);

module.exports = (connection) =>
  connection.models.Contributor || connection.model("Contributor", schema);
