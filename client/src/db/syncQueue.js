import { dbPromise } from "./localDb";

// Add a pending action (create/update/delete) to the queue
export const addToQueue = async (action) => {
  const db = await dbPromise;
  // action = { type: 'create'|'update'|'delete', resource: 'contribution'|'expense', tempId, payload }
  const queueId = await db.add("syncQueue", {
    ...action,
    createdAt: Date.now(),
  });
  return queueId;
};

export const getQueue = async () => {
  const db = await dbPromise;
  return db.getAll("syncQueue");
};

export const removeFromQueue = async (queueId) => {
  const db = await dbPromise;
  await db.delete("syncQueue", queueId);
};

export const queueLength = async () => {
  const db = await dbPromise;
  return db.count("syncQueue");
};
