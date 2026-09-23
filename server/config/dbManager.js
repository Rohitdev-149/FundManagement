const mongoose = require("mongoose");

const connectionCache = new Map();
const pendingConnections = new Map();

const getEventConnection = async (dbName) => {
  if (!dbName) throw new Error("Event database name is required");
  const cached = connectionCache.get(dbName);
  if (cached) return cached;
  const pending = pendingConnections.get(dbName);
  if (pending) return pending;

  const uri = new URL(process.env.MONGO_URI);
  uri.pathname = `/${dbName}`;
  const connectionPromise = mongoose
    .createConnection(uri.toString())
    .asPromise()
    .then((connection) => {
      connectionCache.set(dbName, connection);
      pendingConnections.delete(dbName);
      return connection;
    })
    .catch((err) => {
      pendingConnections.delete(dbName);
      throw err;
    });
  pendingConnections.set(dbName, connectionPromise);
  return connectionPromise;
};

const closeEventConnections = async () => {
  await Promise.all(
    [...connectionCache.values()].map((connection) => connection.close()),
  );
  connectionCache.clear();
  pendingConnections.clear();
};

module.exports = { getEventConnection, closeEventConnections };
