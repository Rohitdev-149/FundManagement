const ExpenseCategory = require("../models/ExpenseCategory");
const Expense = require("../models/Expense");
const {
  isMissing,
  isValidObjectId,
  parseNumber,
} = require("../utils/validation");

const normalizeCategoryPayload = (body, existingEventId) => {
  const eventId = existingEventId || body.eventId;
  const budget = isMissing(body.budget) ? 0 : parseNumber(body.budget);

  if (isMissing(eventId) || isMissing(body.name)) {
    return { error: "eventId and name are required" };
  }

  if (!isValidObjectId(eventId)) {
    return { error: "Valid eventId is required" };
  }

  if (!Number.isFinite(budget) || budget < 0) {
    return { error: "Budget must be zero or more" };
  }

  return {
    value: {
      eventId,
      name: String(body.name).trim(),
      icon: body.icon || "\u{1F4E6}",
      budget,
    },
  };
};

// GET /api/categories?eventId=xxx
exports.getCategories = async (req, res) => {
  try {
    const { eventId } = req.query;
    if (!eventId || !isValidObjectId(eventId)) {
      return res.status(400).json({ message: "Valid eventId is required" });
    }

    const categories = await ExpenseCategory.find({ eventId }).sort({
      name: 1,
    });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/categories
exports.createCategory = async (req, res) => {
  try {
    const normalized = normalizeCategoryPayload(req.body);
    if (normalized.error) {
      return res.status(400).json({ message: normalized.error });
    }

    const category = await ExpenseCategory.create(normalized.value);
    res.status(201).json(category);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/categories/:id
exports.updateCategory = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Valid category id is required" });
    }

    const category = await ExpenseCategory.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    const normalized = normalizeCategoryPayload(
      {
        ...category.toObject(),
        ...req.body,
        eventId: category.eventId.toString(),
      },
      category.eventId,
    );
    if (normalized.error) {
      return res.status(400).json({ message: normalized.error });
    }

    Object.assign(category, normalized.value);
    await category.save();
    res.json(category);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE helper is intentionally not exposed by routes, but prevents accidental
// data loss if a route is added later.
exports.deleteCategory = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Valid category id is required" });
    }

    const expenseCount = await Expense.countDocuments({
      categoryId: req.params.id,
    });
    if (expenseCount > 0) {
      return res
        .status(409)
        .json({ message: "Cannot delete a category with expenses" });
    }

    const category = await ExpenseCategory.findByIdAndDelete(req.params.id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    res.json({ message: "Category deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
