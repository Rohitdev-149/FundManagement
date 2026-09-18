const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

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
    if (!name || !phone || !password) {
      return res
        .status(400)
        .json({ message: "name, phone, and password are required" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      phone,
      passwordHash,
      role: "admin",
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { phone, password } = req.body;
    const user = await User.findOne({ phone });
    if (!user)
      return res.status(400).json({ message: "Invalid phone or password" });

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match)
      return res.status(400).json({ message: "Invalid phone or password" });

    res.json({
      _id: user._id,
      name: user.name,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/auth/create-user — ADMIN ONLY, creates any additional user with a chosen role
exports.createUser = async (req, res) => {
  try {
    const { name, phone, password, role } = req.body;
    if (!name || !phone || !password) {
      return res
        .status(400)
        .json({ message: "name, phone, and password are required" });
    }
    if (!["admin", "treasurer", "viewer"].includes(role)) {
      return res
        .status(400)
        .json({ message: "role must be admin, treasurer, or viewer" });
    }

    const existing = await User.findOne({ phone });
    if (existing)
      return res.status(400).json({ message: "Phone already registered" });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, phone, passwordHash, role });

    // No token returned here — the admin is creating this account for someone else,
    // not logging in as them
    res
      .status(201)
      .json({
        _id: user._id,
        name: user.name,
        phone: user.phone,
        role: user.role,
      });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/auth/users — ADMIN ONLY, list everyone with app access
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select("name phone role createdAt")
      .sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
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
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true },
    ).select("name phone role");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
