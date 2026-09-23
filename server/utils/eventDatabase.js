const mongoose = require("mongoose");
const Event = require("../models/Event");
const { getEventConnection } = require("../config/dbManager");
const contributorModel = require("../models/factories/contributorModel");
const contributionModel = require("../models/factories/contributionModel");
const expenseCategoryModel = require("../models/factories/expenseCategoryModel");
const expenseModel = require("../models/factories/expenseModel");

const databaseNameFromEventName = (name) => {
  const safeName = String(name)
    .trim()
    .replace(/[^A-Za-z0-9_]+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "");

  return safeName || "unnamed";
};

const getEventDatabaseName = (event) =>
  event.dbName || event.databaseName || `event_${event._id.toString()}`;

const getEventModels = async (eventId) => {
  if (!mongoose.Types.ObjectId.isValid(eventId)) return null;

  const event = await Event.findById(eventId).select("dbName databaseName");
  if (!event) return null;

  const connection = await getEventConnection(getEventDatabaseName(event));
  return {
    connection,
    Contributor: contributorModel(connection),
    Contribution: contributionModel(connection),
    ExpenseCategory: expenseCategoryModel(connection),
    Expense: expenseModel(connection),
  };
};

const ensureEventDatabase = async (event) => {
  const models = await getEventModels(event._id);
  if (!models) throw new Error("Event not found while provisioning database");

  await models.connection.db.createCollection("event_metadata").catch((err) => {
    if (err.codeName !== "NamespaceExists") throw err;
  });

  await models.connection.db
    .collection("event_metadata")
    .updateOne(
      { eventId: event._id },
      { $set: { eventId: event._id, name: event.name, updatedAt: new Date() } },
      { upsert: true },
    );
};

module.exports = {
  databaseNameFromEventName,
  ensureEventDatabase,
  getEventModels,
};
