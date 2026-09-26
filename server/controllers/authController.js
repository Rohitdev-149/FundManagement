const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const GlobalUser = require("../models/User");
const Event = require("../models/Event");
const { getEventModels } = require("../utils/eventDatabase");
const { sendPasswordResetEmail } = require("../utils/mailer");

const generateToken = (user, eventId = null) =>
  jwt.sign(
    { id: user._id, ...(eventId ? { eventId: eventId.toString() } : {}) },
    process.env.JWT_SECRET,
    { expiresIn: "30d" },
  );

const publicUser = (user) => ({
  _id: user._id,
  name: user.name,
  phone: user.phone,
  email: user.email || null,
  role: user.role,
  assignedEventId: user.assignedEventId || null,
});

const findEventUserByPhone = async (phone) => {
  const events = await Event.find().select("_id");
  for (const event of events) {
    const models = await getEventModels(event._id);
    const user = await models.User.findOne({ phone });
    if (user) return { user, eventId: event._id };
  }
  return null;
};

const findManagedUser = async (req, id, eventId) => {
  if (req.user.role !== "superadmin") {
    return {
      User: req.eventModels.User,
      user: await req.eventModels.User.findById(id),
    };
  }
  const events = eventId
    ? await Event.findById(eventId).select("_id")
    : await Event.find().select("_id");
  for (const event of events
    ? Array.isArray(events)
      ? events
      : [events]
    : []) {
    const models = await getEventModels(event._id);
    const user = await models.User.findById(id);
    if (user) return { User: models.User, user };
  }
  return { User: null, user: null };
};

exports.register = async (req, res) => {
  try {
    if (await GlobalUser.exists({ role: "superadmin" })) {
      return res.status(403).json({
        message:
          "Registration is closed. Ask an existing admin to create your account.",
      });
    }
    const { name, phone, password, email } = req.body;
    const user = await GlobalUser.create({
      name,
      phone,
      email: email.toLowerCase(),
      passwordHash: await bcrypt.hash(password, 10),
      role: "superadmin",
      assignedEventId: null,
    });
    res.status(201).json({ ...publicUser(user), token: generateToken(user) });
  } catch (err) {
    console.error("Registration failed:", err);
    res.status(err?.code === 11000 ? 409 : 500).json({
      message:
        err?.code === 11000
          ? "Phone already registered"
          : "Internal server error",
    });
  }
};

exports.forgotPassword = async (req, res) => {
  const genericResponse = {
    message: "If an account exists for this email, a reset link has been sent.",
  };
  try {
    const email = req.body.email.toLowerCase();
    const user = await GlobalUser.findOne({ role: "superadmin", email });
    if (!user) return res.json(genericResponse);

    const rawToken = crypto.randomBytes(32).toString("hex");
    user.passwordResetTokenHash = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");
    user.passwordResetExpiresAt = new Date(Date.now() + 60 * 60 * 1000);
    await user.save();

    const appUrl = (process.env.CLIENT_URL || "http://localhost:5173")
      .split(",")[0]
      .trim()
      .replace(/\/$/, "");
    await sendPasswordResetEmail(
      user.email,
      `${appUrl}/reset-password?token=${rawToken}`,
    );
    return res.json(genericResponse);
  } catch (err) {
    console.error("Password reset request failed:", err);
    return res.status(500).json({ message: "Unable to send reset email" });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const tokenHash = crypto
      .createHash("sha256")
      .update(req.body.token)
      .digest("hex");
    const user = await GlobalUser.findOne({
      role: "superadmin",
      passwordResetTokenHash: tokenHash,
      passwordResetExpiresAt: { $gt: new Date() },
    }).select("+passwordResetTokenHash +passwordResetExpiresAt");
    if (!user)
      return res
        .status(400)
        .json({ message: "Reset link is invalid or expired" });

    user.passwordHash = await bcrypt.hash(req.body.password, 10);
    user.passwordResetTokenHash = undefined;
    user.passwordResetExpiresAt = undefined;
    await user.save();
    res.json({ message: "Password reset successful. You can now log in." });
  } catch (err) {
    console.error("Password reset failed:", err);
    res.status(500).json({ message: "Unable to reset password" });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const email = req.body.email.toLowerCase();
    const existing = await GlobalUser.findOne({
      email,
      _id: { $ne: req.user._id },
    });
    if (existing)
      return res.status(409).json({ message: "Email already registered" });
    const user = await GlobalUser.findByIdAndUpdate(
      req.user._id,
      { email },
      { new: true, runValidators: true },
    ).select("name phone email role assignedEventId");
    res.json(user);
  } catch (err) {
    console.error("Profile update failed:", err);
    res.status(500).json({ message: "Unable to update profile" });
  }
};

exports.login = async (req, res) => {
  try {
    const { phone, password } = req.body;
    let user = await GlobalUser.findOne({ phone });
    let eventId = null;
    if (!user) {
      const match = await findEventUserByPhone(phone);
      user = match?.user;
      eventId = match?.eventId || null;
    }
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ message: "Invalid phone or password" });
    }
    res.json({ ...publicUser(user), token: generateToken(user, eventId) });
  } catch (err) {
    console.error("Login failed:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.createUser = async (req, res) => {
  try {
    const { name, phone, password, role } = req.body;
    const assignedEventId =
      req.user.role === "superadmin"
        ? req.body.assignedEventId
        : req.user.assignedEventId;
    if (!["admin", "treasurer", "viewer"].includes(role)) {
      return res
        .status(400)
        .json({ message: "role must be admin, treasurer, or viewer" });
    }
    if (!assignedEventId) {
      return res.status(400).json({ message: "assignedEventId is required" });
    }
    const models = await getEventModels(assignedEventId);
    if (!models)
      return res.status(400).json({ message: "Assigned event not found" });
    if (
      (await GlobalUser.exists({ phone })) ||
      (await findEventUserByPhone(phone))
    ) {
      return res
        .status(400)
        .json({ message: "Phone already registered in this event" });
    }
    const user = await models.User.create({
      name,
      phone,
      passwordHash: await bcrypt.hash(password, 10),
      role,
      assignedEventId,
    });
    res.status(201).json(publicUser(user));
  } catch (err) {
    console.error("User creation failed:", err);
    res.status(err?.code === 11000 ? 409 : 500).json({
      message:
        err?.code === 11000
          ? "Phone already registered in this event"
          : "Internal server error",
    });
  }
};

exports.getUsers = async (req, res) => {
  try {
    if (req.user.role !== "superadmin") {
      return res.json(
        await req.eventModels.User.find()
          .select("name phone role assignedEventId createdAt")
          .sort({ createdAt: -1 }),
      );
    }
    const users = [
      ...(await GlobalUser.find({ role: "superadmin" }).select(
        "name phone role assignedEventId createdAt",
      )),
    ];
    const events = await Event.find().select("_id");
    for (const event of events) {
      const models = await getEventModels(event._id);
      users.push(
        ...(await models.User.find().select(
          "name phone role assignedEventId createdAt",
        )),
      );
    }
    res.json(users.sort((a, b) => b.createdAt - a.createdAt));
  } catch (err) {
    console.error("User listing failed:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

const updateManagedUser = async (req, res, fields) => {
  const context = await findManagedUser(req, req.params.id);
  if (!context.user) return res.status(404).json({ message: "User not found" });
  if (
    req.user._id.toString() === req.params.id &&
    fields.role &&
    fields.role !== "admin"
  ) {
    return res
      .status(400)
      .json({ message: "You cannot remove your own admin access" });
  }
  const targetEventId =
    req.user.role === "superadmin" && req.body.assignedEventId
      ? req.body.assignedEventId.toString()
      : context.user.assignedEventId?.toString();
  const currentEventId = context.user.assignedEventId?.toString();
  if (targetEventId && targetEventId !== currentEventId) {
    const targetModels = await getEventModels(targetEventId);
    if (!targetModels)
      return res.status(400).json({ message: "Assigned event not found" });
    if (
      await targetModels.User.exists({
        phone: fields.phone || context.user.phone,
      })
    ) {
      return res
        .status(409)
        .json({ message: "Phone already registered in target event" });
    }
    const movedUser = await targetModels.User.create({
      ...context.user.toObject(),
      ...fields,
      assignedEventId: targetEventId,
    });
    await context.User.deleteOne({ _id: req.params.id });
    return res.json(movedUser.toObject());
  }
  const user = await context.User.findByIdAndUpdate(req.params.id, fields, {
    new: true,
    runValidators: true,
  }).select("name phone role assignedEventId");
  res.json(user);
};

exports.updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!["admin", "treasurer", "viewer"].includes(role)) {
      return res
        .status(400)
        .json({ message: "role must be admin, treasurer, or viewer" });
    }
    return updateManagedUser(req, res, { role });
  } catch (err) {
    console.error("Role update failed:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const updates = {};
    for (const field of ["name", "phone", "role"]) {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    }
    if (req.body.password)
      updates.passwordHash = await bcrypt.hash(req.body.password, 10);
    return updateManagedUser(req, res, updates);
  } catch (err) {
    console.error("User update failed:", err);
    res.status(err?.code === 11000 ? 409 : 500).json({
      message:
        err?.code === 11000
          ? "Phone already registered in this event"
          : "Internal server error",
    });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    if (req.user._id.toString() === req.params.id) {
      return res
        .status(400)
        .json({ message: "You cannot delete your own account" });
    }
    const context = await findManagedUser(req, req.params.id);
    if (!context.user)
      return res.status(404).json({ message: "User not found" });
    await context.User.deleteOne({ _id: req.params.id });
    res.status(204).send();
  } catch (err) {
    console.error("User deletion failed:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};
