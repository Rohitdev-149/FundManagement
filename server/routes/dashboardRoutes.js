const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const {
  getDashboard,
  categoryWiseReport,
  dateWiseReport,
  budgetVsActual,
} = require("../controllers/dashboardController");

router.get("/events/:eventId/dashboard", protect, getDashboard);
router.get(
  "/events/:eventId/reports/category-wise",
  protect,
  categoryWiseReport,
);
router.get("/events/:eventId/reports/date-wise", protect, dateWiseReport);
router.get(
  "/events/:eventId/reports/budget-vs-actual",
  protect,
  budgetVsActual,
);

module.exports = router;
