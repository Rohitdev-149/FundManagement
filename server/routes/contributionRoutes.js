const express = require("express");
const router = express.Router();
const {
  getContributions,
  createContribution,
  updateContribution,
  deleteContribution,
} = require("../controllers/contributionController");
const { protect } = require("../middleware/auth");
const { allowRoles } = require("../middleware/role");
const { eventDatabase } = require("../middleware/eventDatabase");
const { validateObjectId } = require("../middleware/objectId");
const {
  validateRequest,
  body,
  dateField,
  nonNegativeAmount,
  objectIdField,
  optionalText,
  requiredText,
  PAYMENT_MODES,
  CONTRIBUTION_STATUSES,
} = require("../middleware/validation");

const contributionValidation = [
  objectIdField("contributorId"),
  body("amount")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("amount must be zero or more"),
  body("paymentMode").isIn(PAYMENT_MODES).withMessage("paymentMode is invalid"),
  dateField("date"),
  body("status")
    .optional()
    .isIn(CONTRIBUTION_STATUSES)
    .withMessage("status is invalid"),
  nonNegativeAmount("expectedAmount"),
  optionalText("referenceId"),
  optionalText("note"),
];
const contributionUpdateValidation = [
  body("contributorId")
    .optional()
    .isMongoId()
    .withMessage("contributorId must be a valid ID"),
  body("amount")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("amount must be zero or more"),
  body("paymentMode")
    .optional()
    .isIn(PAYMENT_MODES)
    .withMessage("paymentMode is invalid"),
  dateField("date", false),
  body("status")
    .optional()
    .isIn(CONTRIBUTION_STATUSES)
    .withMessage("status is invalid"),
  nonNegativeAmount("expectedAmount"),
  optionalText("referenceId"),
  optionalText("note"),
];

router.get("/", protect, eventDatabase, getContributions);
router.post(
  "/",
  protect,
  contributionValidation,
  validateRequest,
  eventDatabase,
  allowRoles("superadmin", "admin", "treasurer"),
  createContribution,
);
router.put(
  "/:id",
  protect,
  validateObjectId(),
  contributionUpdateValidation,
  validateRequest,
  eventDatabase,
  allowRoles("superadmin", "admin", "treasurer"),
  updateContribution,
);
router.delete(
  "/:id",
  protect,
  validateObjectId(),
  eventDatabase,
  allowRoles("superadmin", "admin"),
  deleteContribution,
);

module.exports = router;
