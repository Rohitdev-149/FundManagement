const express = require("express");
const router = express.Router();
const {
  getExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
} = require("../controllers/expenseController");
const { protect } = require("../middleware/auth");
const { allowRoles } = require("../middleware/role");

router.get("/", protect, getExpenses);
router.post("/", protect, allowRoles("admin", "treasurer"), createExpense);
router.put("/:id", protect, allowRoles("admin", "treasurer"), updateExpense);
router.delete("/:id", protect, allowRoles("admin"), deleteExpense);

module.exports = router;
