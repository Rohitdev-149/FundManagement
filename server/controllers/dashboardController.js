const Event = require("../models/Event");
const { getEventModels } = require("../utils/eventDatabase");
const { outstandingAmount } = require("../utils/validation");

const calculateDashboard = async (models) => {
  const [
    received,
    expenses,
    contributorCount,
    categoryCount,
    pending,
    recentContributions,
    recentExpenses,
  ] = await Promise.all([
    models.Contribution.find({ status: { $in: ["paid", "partial"] } }),
    models.Expense.find(),
    models.Contributor.countDocuments(),
    models.ExpenseCategory.countDocuments(),
    models.Contribution.find({ status: { $in: ["pending", "partial"] } }),
    models.Contribution.find()
      .populate("contributorId", "name phone")
      .sort({ date: -1, createdAt: -1 })
      .limit(5),
    models.Expense.find()
      .populate("categoryId", "name icon budget")
      .sort({ date: -1, createdAt: -1 })
      .limit(5),
  ]);
  const totalCollection = received.reduce(
    (sum, item) => sum + Number(item.amount || 0),
    0,
  );
  const totalExpense = expenses.reduce(
    (sum, item) => sum + Number(item.amount || 0),
    0,
  );
  const cashIn = received
    .filter((item) => item.paymentMode === "cash")
    .reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const cashOut = expenses
    .filter((item) => item.paymentMode === "cash")
    .reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const upiBankIn = received
    .filter((item) => item.paymentMode !== "cash")
    .reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const upiBankOut = expenses
    .filter((item) => item.paymentMode !== "cash")
    .reduce((sum, item) => sum + Number(item.amount || 0), 0);
  return {
    totalCollection,
    totalExpense,
    balance: totalCollection - totalExpense,
    cashInHand: cashIn - cashOut,
    upiBankBalance: upiBankIn - upiBankOut,
    contributorCount,
    categoryCount,
    expenseCount: expenses.length,
    totalPending: pending.reduce(
      (sum, item) => sum + outstandingAmount(item),
      0,
    ),
    recentContributions,
    recentExpenses,
  };
};

exports.calculateDashboard = calculateDashboard;

exports.getDashboard = async (req, res) => {
  try {
    res.json(await calculateDashboard(req.eventModels));
  } catch (err) {
    console.error("Dashboard request failed:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getOverallDashboard = async (req, res) => {
  try {
    const events = await Event.find().sort({ startDate: -1 });
    const perEvent = await Promise.all(
      events.map(async (event) => ({
        eventId: event._id,
        eventName: event.name,
        ...(await calculateDashboard(await getEventModels(event._id))),
      })),
    );
    const fields = [
      "totalCollection",
      "totalExpense",
      "balance",
      "cashInHand",
      "upiBankBalance",
      "contributorCount",
      "categoryCount",
      "expenseCount",
      "totalPending",
    ];
    const totals = Object.fromEntries(
      fields.map((field) => [
        field,
        perEvent.reduce((sum, item) => sum + item[field], 0),
      ]),
    );
    res.json({ ...totals, perEvent });
  } catch (err) {
    console.error("Overall dashboard request failed:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.categoryWiseReport = async (req, res) => {
  try {
    res.json(
      await req.eventModels.Expense.aggregate([
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
      ]),
    );
  } catch (err) {
    console.error("Dashboard request failed:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.dateWiseReport = async (req, res) => {
  try {
    const [contributionsByDate, expensesByDate] = await Promise.all([
      req.eventModels.Contribution.aggregate([
        { $match: { status: { $in: ["paid", "partial"] } } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
            total: { $sum: "$amount" },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      req.eventModels.Expense.aggregate([
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
    console.error("Dashboard request failed:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.budgetVsActual = async (req, res) => {
  try {
    const categories = await req.eventModels.ExpenseCategory.find().sort({
      name: 1,
    });
    const spent = await req.eventModels.Expense.aggregate([
      { $group: { _id: "$categoryId", total: { $sum: "$amount" } } },
    ]);
    const spentMap = new Map(
      spent.map((row) => [row._id.toString(), row.total]),
    );
    res.json(
      categories.map((category) => {
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
      }),
    );
  } catch (err) {
    console.error("Dashboard request failed:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};
