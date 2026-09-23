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
const { eventDatabase } = require("../middleware/eventDatabase");
const { validateObjectId } = require("../middleware/objectId");
const {
  validateRequest,
  body,
  dateField,
  objectIdField,
  optionalText,
  requiredText,
  positiveAmount,
  PAYMENT_MODES,
} = require("../middleware/validation");

const expenseValidation = [
  objectIdField("categoryId"),
  requiredText("name"),
  positiveAmount(),
  body("paymentMode").isIn(PAYMENT_MODES).withMessage("paymentMode is invalid"),
  dateField("date"),
  optionalText("vendor"),
  optionalText("note"),
];
const expenseUpdateValidation = [
  body("categoryId")
    .optional()
    .isMongoId()
    .withMessage("categoryId must be a valid ID"),
  body("name").optional().trim().notEmpty().withMessage("name is required"),
  body("amount")
    .optional()
    .isFloat({ gt: 0 })
    .withMessage("amount must be greater than 0"),
  body("paymentMode")
    .optional()
    .isIn(PAYMENT_MODES)
    .withMessage("paymentMode is invalid"),
  dateField("date", false),
  optionalText("vendor"),
  optionalText("note"),
];

router.get("/", protect, eventDatabase, getExpenses);
router.post(
  "/",
  protect,
  expenseValidation,
  validateRequest,
  eventDatabase,
  allowRoles("superadmin", "admin", "treasurer"),
  createExpense,
);
router.put(
  "/:id",
  protect,
  validateObjectId(),
  expenseUpdateValidation,
  validateRequest,
  eventDatabase,
  allowRoles("superadmin", "admin", "treasurer"),
  updateExpense,
);
router.delete(
  "/:id",
  protect,
  validateObjectId(),
  eventDatabase,
  allowRoles("superadmin", "admin"),
  deleteExpense,
);

module.exports = router;
