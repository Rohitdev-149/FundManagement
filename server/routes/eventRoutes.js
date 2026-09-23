const express = require("express");
const router = express.Router();
const {
  getEvents,
  createEvent,
  updateEvent,
} = require("../controllers/eventController");
const { protect } = require("../middleware/auth");
const { allowRoles } = require("../middleware/role");
const { validateObjectId } = require("../middleware/objectId");
const {
  validateRequest,
  body,
  dateField,
  nonNegativeAmount,
  requiredText,
} = require("../middleware/validation");

const eventValidation = [
  requiredText("name"),
  dateField("startDate"),
  dateField("endDate", false),
  nonNegativeAmount("totalBudget"),
];

router.get("/", protect, getEvents);
router.post(
  "/",
  protect,
  allowRoles("superadmin"),
  eventValidation,
  validateRequest,
  createEvent,
);
router.put(
  "/:id",
  protect,
  validateObjectId(),
  allowRoles("superadmin", "admin"),
  eventValidation,
  validateRequest,
  updateEvent,
);

module.exports = router;
