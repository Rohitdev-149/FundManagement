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

router.get("/", protect, getContributions);
router.post("/", protect, allowRoles("admin", "treasurer"), createContribution);
router.put(
  "/:id",
  protect,
  allowRoles("admin", "treasurer"),
  updateContribution,
);
router.delete("/:id", protect, allowRoles("admin"), deleteContribution);

module.exports = router;
