const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const {
  getDashboard,
  getOverallDashboard,
  categoryWiseReport,
  dateWiseReport,
  budgetVsActual,
} = require("../controllers/dashboardController");
const { eventDatabase } = require("../middleware/eventDatabase");
const { allowRoles } = require("../middleware/role");
const { validateObjectId } = require("../middleware/objectId");

router.get(
  "/dashboard/overall",
  protect,
  allowRoles("superadmin"),
  getOverallDashboard,
);
router.get(
  "/events/:eventId/dashboard",
  protect,
  validateObjectId("eventId"),
  eventDatabase,
  getDashboard,
);
router.get(
  "/events/:eventId/reports/category-wise",
  protect,
  validateObjectId("eventId"),
  eventDatabase,
  categoryWiseReport,
);
router.get(
  "/events/:eventId/reports/date-wise",
  protect,
  validateObjectId("eventId"),
  eventDatabase,
  dateWiseReport,
);
router.get(
  "/events/:eventId/reports/budget-vs-actual",
  protect,
  validateObjectId("eventId"),
  eventDatabase,
  budgetVsActual,
);

module.exports = router;
