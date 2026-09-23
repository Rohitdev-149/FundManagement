const { body, validationResult } = require("express-validator");

const PHONE_PATTERN = /^\+?[1-9]\d{9,14}$/;
const PAYMENT_MODES = ["cash", "upi", "bank", "other"];
const CONTRIBUTION_STATUSES = ["paid", "pending", "partial"];
const USER_ROLES = ["admin", "treasurer", "viewer"];

const validateRequest = (req, res, next) => {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    return res.status(400).json({
      message: "Validation failed",
      errors: result
        .array()
        .map(({ path, msg }) => ({ field: path, message: msg })),
    });
  }
  return next();
};

const requiredText = (field, label = field) =>
  body(field).trim().notEmpty().withMessage(`${label} is required`);

const optionalText = (field) => body(field).optional({ nullable: true }).trim();

const positiveAmount = (field = "amount") =>
  body(field)
    .notEmpty()
    .withMessage(`${field} is required`)
    .bail()
    .isFloat({ gt: 0 })
    .withMessage(`${field} must be greater than 0`);

const nonNegativeAmount = (field) =>
  body(field)
    .optional({ nullable: true })
    .isFloat({ min: 0 })
    .withMessage(`${field} must be zero or more`);

const dateField = (field, required = true) => {
  const validator = body(field);
  if (!required) validator.optional({ nullable: true });
  return validator
    .isISO8601({ strict: true, strictSeparator: true })
    .withMessage(`${field} must be a valid date`)
    .custom((value) => {
      const date = new Date(value);
      const latestAllowed = new Date();
      latestAllowed.setFullYear(latestAllowed.getFullYear() + 10);
      if (date > latestAllowed)
        throw new Error(`${field} cannot be more than 10 years in the future`);
      return true;
    });
};

const phoneField = (field = "phone") =>
  body(field)
    .trim()
    .matches(PHONE_PATTERN)
    .withMessage("phone must be a valid international or 10-15 digit number");

const objectIdField = (field) =>
  body(field).isMongoId().withMessage(`${field} must be a valid ID`);

module.exports = {
  CONTRIBUTION_STATUSES,
  PAYMENT_MODES,
  USER_ROLES,
  body,
  dateField,
  nonNegativeAmount,
  objectIdField,
  optionalText,
  phoneField,
  positiveAmount,
  requiredText,
  validateRequest,
};
