const mongoose = require("mongoose");
const Event = require("../models/Event");
const GlobalUser = require("../models/User");
const { getEventConnection } = require("../config/dbManager");
const contributorModel = require("../models/factories/contributorModel");
const contributionModel = require("../models/factories/contributionModel");
const expenseCategoryModel = require("../models/factories/expenseCategoryModel");
const expenseModel = require("../models/factories/expenseModel");
const userModel = require("../models/factories/userModel");

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
    User: userModel(connection),
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

const migrateLegacyUsers = async () => {
  const legacyUsers = await GlobalUser.find({ role: { $ne: "superadmin" } });
  for (const legacyUser of legacyUsers) {
    if (!legacyUser.assignedEventId) {
      console.warn(`Skipping user ${legacyUser._id}: no event assigned`);
      continue;
    }
    const models = await getEventModels(legacyUser.assignedEventId);
    if (!models) {
      console.warn(`Skipping user ${legacyUser._id}: event not found`);
      continue;
    }
    try {
      await models.User.create(legacyUser.toObject());
      await GlobalUser.deleteOne({ _id: legacyUser._id });
    } catch (err) {
      if (err?.code === 11000) {
        console.warn(
          `Skipping user ${legacyUser._id}: duplicate phone in event database`,
        );
      } else {
        throw err;
      }
    }
  }
};

module.exports = {
  databaseNameFromEventName,
  ensureEventDatabase,
  getEventModels,
  migrateLegacyUsers,
};
