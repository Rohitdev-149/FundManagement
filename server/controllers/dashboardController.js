const Contribution = require("../models/Contribution");
const Expense = require("../models/Expense");
const Contributor = require("../models/Contributor");
const ExpenseCategory = require("../models/ExpenseCategory");
const {
  isValidObjectId,
  outstandingAmount,
  toObjectId,
} = require("../utils/validation");

const receivedContributionFilter = (eventId) => ({
  eventId,
  status: { $in: ["paid", "partial"] },
});

const validateEventId = (eventId, res) => {
  if (!isValidObjectId(eventId)) {
    res.status(400).json({ message: "Valid eventId is required" });
    return false;
  }
  return true;
};

// GET /api/events/:eventId/dashboard
exports.getDashboard = async (req, res) => {
  try {
    const { eventId } = req.params;
    if (!validateEventId(eventId, res)) return;

    const [
      receivedContributions,
      expenses,
      contributorCount,
      categoryCount,
      pendingContributions,
      recentContributions,
      recentExpenses,
    ] = await Promise.all([
      Contribution.find(receivedContributionFilter(eventId)),
      Expense.find({ eventId }),
      Contributor.countDocuments({ eventId }),
      ExpenseCategory.countDocuments({ eventId }),
      Contribution.find({
        eventId,
        status: { $in: ["pending", "partial"] },
      }),
      Contribution.find({ eventId })
        .populate("contributorId", "name phone")
        .sort({ date: -1, createdAt: -1 })
        .limit(5),
      Expense.find({ eventId })
        .populate("categoryId", "name icon budget")
        .sort({ date: -1, createdAt: -1 })
        .limit(5),
    ]);

    const totalCollection = receivedContributions.reduce(
      (sum, contribution) => sum + Number(contribution.amount || 0),
      0,
    );
    const totalExpense = expenses.reduce(
      (sum, expense) => sum + Number(expense.amount || 0),
      0,
    );
    const balance = totalCollection - totalExpense;

    const cashIn = receivedContributions
      .filter((contribution) => contribution.paymentMode === "cash")
      .reduce((sum, contribution) => sum + Number(contribution.amount || 0), 0);
    const cashOut = expenses
      .filter((expense) => expense.paymentMode === "cash")
      .reduce((sum, expense) => sum + Number(expense.amount || 0), 0);
    const cashInHand = cashIn - cashOut;

    const upiBankIn = receivedContributions
      .filter((contribution) => contribution.paymentMode !== "cash")
      .reduce((sum, contribution) => sum + Number(contribution.amount || 0), 0);
    const upiBankOut = expenses
      .filter((expense) => expense.paymentMode !== "cash")
      .reduce((sum, expense) => sum + Number(expense.amount || 0), 0);
    const upiBankBalance = upiBankIn - upiBankOut;

    const totalPending = pendingContributions.reduce(
      (sum, contribution) => sum + outstandingAmount(contribution),
      0,
    );

    res.json({
      totalCollection,
      totalExpense,
      balance,
      cashInHand,
      upiBankBalance,
      contributorCount,
      categoryCount,
      expenseCount: expenses.length,
      totalPending,
      recentContributions,
      recentExpenses,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/events/:eventId/reports/category-wise
exports.categoryWiseReport = async (req, res) => {
  try {
    const { eventId } = req.params;
    if (!validateEventId(eventId, res)) return;

    const result = await Expense.aggregate([
      { $match: { eventId: toObjectId(eventId) } },
      { $group: { _id: "$categoryId", total: { $sum: "$amount" } } },
      {
        $lookup: {
          from: "expensecategories",
          localField: "_id",
          foreignField: "_id",
          as: "category",
        },
      },
      { $unwind: "$category" },
      {
        $project: {
          _id: 0,
          categoryId: "$_id",
          name: "$category.name",
          icon: "$category.icon",
          total: 1,
        },
      },
      { $sort: { total: -1 } },
    ]);
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/events/:eventId/reports/date-wise
exports.dateWiseReport = async (req, res) => {
  try {
    const { eventId } = req.params;
    if (!validateEventId(eventId, res)) return;

    const [contributionsByDate, expensesByDate] = await Promise.all([
      Contribution.aggregate([
        {
          $match: {
            eventId: toObjectId(eventId),
            status: { $in: ["paid", "partial"] },
          },
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
            total: { $sum: "$amount" },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      Expense.aggregate([
        { $match: { eventId: toObjectId(eventId) } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
            total: { $sum: "$amount" },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ]);

    res.json({ contributionsByDate, expensesByDate });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/events/:eventId/reports/budget-vs-actual
exports.budgetVsActual = async (req, res) => {
  try {
    const { eventId } = req.params;
    if (!validateEventId(eventId, res)) return;

    const categories = await ExpenseCategory.find({ eventId }).sort({
      name: 1,
    });
    const categoryIds = categories.map((category) => category._id);
    const spentByCategory = await Expense.aggregate([
      {
        $match: {
          eventId: toObjectId(eventId),
          categoryId: { $in: categoryIds },
        },
      },
      { $group: { _id: "$categoryId", total: { $sum: "$amount" } } },
    ]);

    const spentMap = new Map(
      spentByCategory.map((row) => [row._id.toString(), row.total]),
    );

    const result = categories.map((category) => {
      const spentAmount = spentMap.get(category._id.toString()) || 0;
      const budget = Number(category.budget || 0);
      return {
        categoryId: category._id,
        name: category.name,
        icon: category.icon,
        budget,
        spent: spentAmount,
        remaining: budget - spentAmount,
        overBudget: budget > 0 && spentAmount > budget,
      };
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
