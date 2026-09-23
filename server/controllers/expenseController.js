const {
  isValidObjectId,
  parseDateRange,
  parsePagination,
  parseNumber,
} = require("../utils/validation");
const VALID_PAYMENT_MODES = new Set(["cash", "upi", "bank", "other"]);

const categoryBelongsToEvent = async (models, categoryId) =>
  Boolean(await models.ExpenseCategory.exists({ _id: categoryId }));

const filterFor = (query) => {
  const filter = {};
  if (query.category) {
    if (!isValidObjectId(query.category))
      return { error: "Invalid category ID filter" };
    filter.categoryId = query.category;
  }
  if (query.mode) {
    if (!VALID_PAYMENT_MODES.has(query.mode))
      return { error: "Invalid payment mode filter" };
    filter.paymentMode = query.mode;
  }
  const range = parseDateRange(query);
  if (range.error) return range;
  if (Object.keys(range.value).length) filter.date = range.value;
  return { value: filter };
};

const normalize = async (body, models) => {
  const amount = parseNumber(body.amount);
  if (!isValidObjectId(body.categoryId))
    return { error: "Valid categoryId is required" };
  if (!VALID_PAYMENT_MODES.has(body.paymentMode))
    return { error: "Invalid payment mode" };
  if (!Number.isFinite(amount) || amount <= 0)
    return { error: "Amount must be greater than 0" };
  if (!(await categoryBelongsToEvent(models, body.categoryId)))
    return { error: "Category does not belong to this event" };
  return {
    value: {
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

exports.getExpenses = async (req, res) => {
  try {
    const pagination = parsePagination(req.query);
    if (pagination.error)
      return res.status(400).json({ message: pagination.error });
    const filter = filterFor(req.query);
    if (filter.error) return res.status(400).json({ message: filter.error });
    res.json(
      await req.eventModels.Expense.find(filter.value)
        .populate("categoryId", "name icon budget")
        .sort({ date: -1 })
        .skip(pagination.value.skip)
        .limit(pagination.value.limit),
    );
  } catch (err) {
    console.error("Expense request failed:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.createExpense = async (req, res) => {
  try {
    const normalized = await normalize(req.body, req.eventModels);
    if (normalized.error)
      return res.status(400).json({ message: normalized.error });
    const expense = await req.eventModels.Expense.create({
      ...normalized.value,
      createdBy: req.user._id,
    });
    await expense.populate("categoryId", "name icon budget");
    res.status(201).json(expense);
  } catch (err) {
    console.error("Expense request failed:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.updateExpense = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id))
      return res.status(400).json({ message: "Valid expense id is required" });
    const expense = await req.eventModels.Expense.findById(req.params.id);
    if (!expense) return res.status(404).json({ message: "Expense not found" });
    const normalized = await normalize(
      { ...expense.toObject(), ...req.body },
      req.eventModels,
    );
    if (normalized.error)
      return res.status(400).json({ message: normalized.error });
    Object.assign(expense, normalized.value);
    await expense.save();
    await expense.populate("categoryId", "name icon budget");
    res.json(expense);
  } catch (err) {
    console.error("Expense request failed:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.deleteExpense = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id))
      return res.status(400).json({ message: "Valid expense id is required" });
    if (!(await req.eventModels.Expense.findByIdAndDelete(req.params.id)))
      return res.status(404).json({ message: "Expense not found" });
    res.status(204).send();
  } catch (err) {
    console.error("Expense request failed:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};
