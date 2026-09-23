const {
  isMissing,
  isValidObjectId,
  parseNumber,
} = require("../utils/validation");

const normalizePayload = (body) => {
  const budget = isMissing(body.budget) ? 0 : parseNumber(body.budget);
  if (!Number.isFinite(budget) || budget < 0)
    return { error: "Budget must be zero or more" };
  return {
    value: {
      name: String(body.name).trim(),
      icon: body.icon || "\u{1F4E6}",
      budget,
    },
  };
};

exports.getCategories = async (req, res) => {
  try {
    res.json(await req.eventModels.ExpenseCategory.find().sort({ name: 1 }));
  } catch (err) {
    console.error("Category request failed:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.createCategory = async (req, res) => {
  try {
    const normalized = normalizePayload(req.body);
    const duplicate = await req.eventModels.ExpenseCategory.exists({
      name: {
        $regex: `^${normalized.value.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
        $options: "i",
      },
    });
    if (duplicate)
      return res.status(409).json({
        message: "A category with this name already exists in this event",
      });
    res
      .status(201)
      .json(await req.eventModels.ExpenseCategory.create(normalized.value));
  } catch (err) {
    console.error("Category request failed:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id))
      return res.status(400).json({ message: "Valid category id is required" });
    const category = await req.eventModels.ExpenseCategory.findById(
      req.params.id,
    );
    if (!category)
      return res.status(404).json({ message: "Category not found" });
    const normalized = normalizePayload({
      ...category.toObject(),
      ...req.body,
    });
    if (normalized.error)
      return res.status(400).json({ message: normalized.error });
    Object.assign(category, normalized.value);
    await category.save();
    res.json(category);
  } catch (err) {
    console.error("Category request failed:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id))
      return res.status(400).json({ message: "Valid category id is required" });
    if (await req.eventModels.Expense.exists({ categoryId: req.params.id }))
      return res
        .status(409)
        .json({ message: "Cannot delete a category with expenses" });
    const category = await req.eventModels.ExpenseCategory.findByIdAndDelete(
      req.params.id,
    );
    if (!category)
      return res.status(404).json({ message: "Category not found" });
    res.status(204).send();
  } catch (err) {
    console.error("Category request failed:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};
