import { openDB } from "idb";

const DB_NAME = "fund-manager-offline-db";
const DB_VERSION = 1;

export const dbPromise = openDB(DB_NAME, DB_VERSION, {
  upgrade(db) {
    // Cached data — mirrors what the server would return, for offline reading
    if (!db.objectStoreNames.contains("contributions")) {
      db.createObjectStore("contributions", { keyPath: "_id" });
    }
    if (!db.objectStoreNames.contains("expenses")) {
      db.createObjectStore("expenses", { keyPath: "_id" });
    }
    if (!db.objectStoreNames.contains("contributors")) {
      db.createObjectStore("contributors", { keyPath: "_id" });
    }
    if (!db.objectStoreNames.contains("categories")) {
      db.createObjectStore("categories", { keyPath: "_id" });
    }
    // The sync queue — every offline write waits here until it can reach the server
    if (!db.objectStoreNames.contains("syncQueue")) {
      db.createObjectStore("syncQueue", {
        keyPath: "queueId",
        autoIncrement: true,
      });
    }
  },
});

// Generic helpers used by every resource
export const cacheAll = async (storeName, items) => {
  const db = await dbPromise;
  const tx = db.transaction(storeName, "readwrite");
  await Promise.all(items.map((item) => tx.store.put(item)));
  await tx.done;
};

export const cacheOne = async (storeName, item) => {
  const db = await dbPromise;
  await db.put(storeName, item);
};

export const getAllCached = async (storeName) => {
  const db = await dbPromise;
  return db.getAll(storeName);
};

export const deleteCached = async (storeName, id) => {
  const db = await dbPromise;
  await db.delete(storeName, id);
};
