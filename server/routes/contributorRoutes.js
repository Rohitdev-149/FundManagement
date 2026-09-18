const express = require("express");
const router = express.Router();
const {
  getContributors,
  createContributor,
  updateContributor,
  deleteContributor,
  getContributorHistory,
} = require("../controllers/contributorController");
const { protect } = require("../middleware/auth");
const { allowRoles } = require("../middleware/role");

router.get("/", protect, getContributors);
router.post("/", protect, allowRoles("admin", "treasurer"), createContributor);
router.put(
  "/:id",
  protect,
  allowRoles("admin", "treasurer"),
  updateContributor,
);
router.delete("/:id", protect, allowRoles("admin"), deleteContributor);
router.get("/:id/history", protect, getContributorHistory);

module.exports = router;
