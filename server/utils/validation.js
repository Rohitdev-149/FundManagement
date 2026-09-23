const mongoose = require("mongoose");

const isMissing = (value) =>
  value === undefined || value === null || value === "";

const parseNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : NaN;
};

const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

const toObjectId = (value) => new mongoose.Types.ObjectId(value);

const parseDateRange = (query) => {
  const filter = {};
  if (!query.from && !query.to) return { value: filter };

  if (query.from) {
    const from = new Date(query.from);
    if (Number.isNaN(from.getTime())) {
      return { error: "Valid from date is required" };
    }
    filter.$gte = from;
  }

  if (query.to) {
    const to = new Date(query.to);
    if (Number.isNaN(to.getTime())) {
      return { error: "Valid to date is required" };
    }
    if (/^\d{4}-\d{2}-\d{2}$/.test(query.to)) {
      to.setHours(23, 59, 59, 999);
    }
    filter.$lte = to;
  }

  return { value: filter };
};

const parsePagination = (query) => {
  const page = Number.parseInt(query.page || "1", 10);
  const limit = Number.parseInt(query.limit || "50", 10);
  if (!Number.isInteger(page) || page < 1)
    return { error: "page must be a positive integer" };
  if (!Number.isInteger(limit) || limit < 1 || limit > 100)
    return { error: "limit must be an integer between 1 and 100" };
  return { value: { page, limit, skip: (page - 1) * limit } };
};

const outstandingAmount = (contribution) =>
  Math.max(
    Number(contribution.expectedAmount || 0) - Number(contribution.amount || 0),
    0,
  );

module.exports = {
  isMissing,
  isValidObjectId,
  outstandingAmount,
  parseDateRange,
  parsePagination,
  parseNumber,
  toObjectId,
};
