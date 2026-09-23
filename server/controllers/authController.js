const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Event = require("../models/Event");

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });

// POST /api/auth/register — PUBLIC, but only works ONCE (bootstraps the first admin)
exports.register = async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    if (userCount > 0) {
      return res.status(403).json({
        message:
          "Registration is closed. Ask an existing admin to create your account.",
      });
    }

    const { name, phone, password } = req.body;
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      phone,
      passwordHash,
      role: "superadmin",
      assignedEventId: null,
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      role: user.role,
      assignedEventId: user.assignedEventId,
      token: generateToken(user._id),
    });
  } catch (err) {
    console.error("Registration failed:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { phone, password } = req.body;
    const user = await User.findOne({ phone });
    if (!user)
      return res.status(401).json({ message: "Invalid phone or password" });

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match)
      return res.status(401).json({ message: "Invalid phone or password" });

    res.json({
      _id: user._id,
      name: user.name,
      role: user.role,
      assignedEventId: user.assignedEventId,
      token: generateToken(user._id),
    });
  } catch (err) {
    console.error("Login failed:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// POST /api/auth/create-user — ADMIN ONLY, creates any additional user with a chosen role
exports.createUser = async (req, res) => {
  try {
    const { name, phone, password, role } = req.body;
    const assignedEventId =
      req.user.role === "superadmin"
        ? req.body.assignedEventId || null
        : req.user.assignedEventId;
    if (!["admin", "treasurer", "viewer"].includes(role)) {
      return res
        .status(400)
        .json({ message: "role must be admin, treasurer, or viewer" });
    }
    if (!assignedEventId) {
      return res.status(400).json({ message: "assignedEventId is required" });
    }
    if (!(await Event.exists({ _id: assignedEventId }))) {
      return res.status(400).json({ message: "Assigned event not found" });
    }

    const existing = await User.findOne({ phone });
    if (existing)
      return res.status(400).json({ message: "Phone already registered" });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      phone,
      passwordHash,
      role,
      assignedEventId,
    });

    // No token returned here — the admin is creating this account for someone else,
    // not logging in as them
    res.status(201).json({
      _id: user._id,
      name: user.name,
      phone: user.phone,
      role: user.role,
      assignedEventId: user.assignedEventId,
    });
  } catch (err) {
    console.error("User creation failed:", err);
    if (err?.code === 11000)
      return res.status(409).json({ message: "Phone already registered" });
    res.status(500).json({ message: "Internal server error" });
  }
};

// GET /api/auth/users — ADMIN ONLY, list everyone with app access
exports.getUsers = async (req, res) => {
  try {
    const userFilter =
      req.user.role === "superadmin"
        ? {}
        : { assignedEventId: req.user.assignedEventId };
    const users = await User.find(userFilter)
      .select("name phone role assignedEventId createdAt")
      .sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    console.error("User listing failed:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// PUT /api/auth/users/:id/role — ADMIN ONLY, change someone's role
exports.updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!["admin", "treasurer", "viewer"].includes(role)) {
      return res
        .status(400)
        .json({ message: "role must be admin, treasurer, or viewer" });
    }
    if (req.user._id.toString() === req.params.id && role !== "admin") {
      return res
        .status(400)
        .json({ message: "You cannot remove your own admin access" });
    }
    const target = await User.findById(req.params.id).select("assignedEventId");
    if (!target) return res.status(404).json({ message: "User not found" });
    if (
      req.user.role !== "superadmin" &&
      target.assignedEventId?.toString() !== req.user.assignedEventId.toString()
    ) {
      return res.status(403).json({ message: "Not permitted for this user" });
    }
    const update = { role };
    if (
      req.user.role === "superadmin" &&
      req.body.assignedEventId !== undefined
    ) {
      update.assignedEventId = req.body.assignedEventId || null;
      if (
        update.assignedEventId &&
        !(await Event.exists({ _id: update.assignedEventId }))
      ) {
        return res.status(400).json({ message: "Assigned event not found" });
      }
    }
    const user = await User.findByIdAndUpdate(req.params.id, update, {
      new: true,
      runValidators: true,
    }).select("name phone role assignedEventId");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    console.error("Role update failed:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

const findManageableUser = async (req, id) => {
  const target = await User.findById(id);
  if (!target) return { error: { status: 404, message: "User not found" } };
  if (
    req.user.role !== "superadmin" &&
    target.assignedEventId?.toString() !== req.user.assignedEventId.toString()
  ) {
    return { error: { status: 403, message: "Not permitted for this user" } };
  }
  return { user: target };
};

exports.updateUser = async (req, res) => {
  try {
    const result = await findManageableUser(req, req.params.id);
    if (result.error)
      return res
        .status(result.error.status)
        .json({ message: result.error.message });

    if (
      req.user._id.toString() === req.params.id &&
      req.body.role &&
      req.body.role !== "admin"
    ) {
      return res
        .status(400)
        .json({ message: "You cannot remove your own admin access" });
    }

    const updates = {};
    for (const field of ["name", "phone", "role"]) {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    }
    if (req.body.password)
      updates.passwordHash = await bcrypt.hash(req.body.password, 10);
    if (
      req.user.role === "superadmin" &&
      req.body.assignedEventId !== undefined
    ) {
      updates.assignedEventId = req.body.assignedEventId || null;
      if (
        updates.assignedEventId &&
        !(await Event.exists({ _id: updates.assignedEventId }))
      ) {
        return res.status(400).json({ message: "Assigned event not found" });
      }
    }

    if (
      updates.phone &&
      (await User.exists({ phone: updates.phone, _id: { $ne: req.params.id } }))
    ) {
      return res.status(409).json({ message: "Phone already registered" });
    }

    const user = await User.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    }).select("name phone role assignedEventId");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    console.error("User update failed:", err);
    if (err?.code === 11000)
      return res.status(409).json({ message: "Phone already registered" });
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    if (req.user._id.toString() === req.params.id) {
      return res
        .status(400)
        .json({ message: "You cannot delete your own account" });
    }
    const result = await findManageableUser(req, req.params.id);
    if (result.error)
      return res
        .status(result.error.status)
        .json({ message: result.error.message });
    await User.deleteOne({ _id: req.params.id });
    res.status(204).send();
  } catch (err) {
    console.error("User deletion failed:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};
