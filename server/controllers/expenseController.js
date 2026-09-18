const Expense = require("../models/Expense");
const ExpenseCategory = require("../models/ExpenseCategory");
const {
  isMissing,
  isValidObjectId,
  parseDateRange,
  parseNumber,
} = require("../utils/validation");

const VALID_PAYMENT_MODES = new Set(["cash", "upi", "bank", "other"]);

const buildFilter = (query) => {
  const filter = { eventId: query.eventId };
  if (query.category) filter.categoryId = query.category;
  if (query.mode) filter.paymentMode = query.mode;
  const dateRange = parseDateRange(query);
  if (dateRange.error) return dateRange;
  if (Object.keys(dateRange.value).length > 0) filter.date = dateRange.value;
  return { value: filter };
};

const normalizeExpensePayload = async (body, existingEventId) => {
  const eventId = existingEventId || body.eventId;
  const amount = parseNumber(body.amount);

  if (
    isMissing(eventId) ||
    isMissing(body.categoryId) ||
    isMissing(body.name) ||
    isMissing(body.amount) ||
    isMissing(body.paymentMode) ||
    isMissing(body.date)
  ) {
    return {
      error: "eventId, categoryId, name, amount, paymentMode, date are required",
    };
  }

  if (!isValidObjectId(eventId) || !isValidObjectId(body.categoryId)) {
    return { error: "Valid eventId and categoryId are required" };
  }

  if (!VALID_PAYMENT_MODES.has(body.paymentMode)) {
    return { error: "Invalid payment mode" };
  }

  if (!Number.isFinite(amount) || amount <= 0) {
    return { error: "Amount must be greater than 0" };
  }

  const category = await ExpenseCategory.findOne({
    _id: body.categoryId,
    eventId,
  });
  if (!category) {
    return { error: "Category does not belong to this event" };
  }

  return {
    value: {
      eventId,
      categoryId: body.categoryId,
      name: String(body.name).trim(),
      amount,
      vendor: body.vendor || "",
      paymentMode: body.paymentMode,
      date: body.date,
      note: body.note || "",
    },
  };
};

// GET /api/expenses?eventId=&category=&mode=&from=&to=
exports.getExpenses = async (req, res) => {
  try {
    if (!req.query.eventId || !isValidObjectId(req.query.eventId)) {
      return res.status(400).json({ message: "Valid eventId is required" });
    }
    const builtFilter = buildFilter(req.query);
    if (builtFilter.error) {
      return res.status(400).json({ message: builtFilter.error });
    }
    const expenses = await Expense.find(builtFilter.value)
      .populate("categoryId", "name icon budget")
      .sort({ date: -1 });
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/expenses
exports.createExpense = async (req, res) => {
  try {
    const normalized = await normalizeExpensePayload(req.body);
    if (normalized.error) {
      return res.status(400).json({ message: normalized.error });
    }

    const expense = await Expense.create({
      ...normalized.value,
      createdBy: req.user._id,
    });
    await expense.populate("categoryId", "name icon budget");
    res.status(201).json(expense);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/expenses/:id
exports.updateExpense = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Valid expense id is required" });
    }

    const expense = await Expense.findById(req.params.id);
    if (!expense) return res.status(404).json({ message: "Expense not found" });

    const merged = {
      ...expense.toObject(),
      ...req.body,
      eventId: expense.eventId.toString(),
    };
    const normalized = await normalizeExpensePayload(merged, expense.eventId);
    if (normalized.error) {
      return res.status(400).json({ message: normalized.error });
    }

    Object.assign(expense, normalized.value);
    await expense.save();
    await expense.populate("categoryId", "name icon budget");
    res.json(expense);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/expenses/:id
exports.deleteExpense = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Valid expense id is required" });
    }

    const expense = await Expense.findByIdAndDelete(req.params.id);
    if (!expense) return res.status(404).json({ message: "Expense not found" });
    res.json({ message: "Expense deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
