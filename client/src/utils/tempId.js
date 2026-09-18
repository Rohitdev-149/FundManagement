// Generates a unique local ID for items created while offline, e.g. "temp_1732882991234_x7k2p"
export const generateTempId = () =>
  `temp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

export const isTempId = (id) =>
  typeof id === "string" && id.startsWith("temp_");
