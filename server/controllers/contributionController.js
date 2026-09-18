const Contribution = require("../models/Contribution");
const Contributor = require("../models/Contributor");
const {
  isMissing,
  isValidObjectId,
  parseDateRange,
  parseNumber,
} = require("../utils/validation");

const VALID_STATUSES = new Set(["paid", "pending", "partial"]);
const VALID_PAYMENT_MODES = new Set(["cash", "upi", "bank", "other"]);

const buildFilter = (query) => {
  const filter = { eventId: query.eventId };
  if (query.status) filter.status = query.status;
  if (query.mode) filter.paymentMode = query.mode;
  const dateRange = parseDateRange(query);
  if (dateRange.error) return dateRange;
  if (Object.keys(dateRange.value).length > 0) filter.date = dateRange.value;
  return { value: filter };
};

const normalizeContributionPayload = async (body, existingEventId) => {
  const eventId = existingEventId || body.eventId;
  const status = body.status || "paid";
  const amount = parseNumber(body.amount);
  const expectedAmount = isMissing(body.expectedAmount)
    ? undefined
    : parseNumber(body.expectedAmount);

  if (
    isMissing(eventId) ||
    isMissing(body.contributorId) ||
    isMissing(body.amount) ||
    isMissing(body.paymentMode) ||
    isMissing(body.date)
  ) {
    return {
      error: "eventId, contributorId, amount, paymentMode, date are required",
    };
  }

  if (!isValidObjectId(eventId) || !isValidObjectId(body.contributorId)) {
    return { error: "Valid eventId and contributorId are required" };
  }

  if (!VALID_STATUSES.has(status)) {
    return { error: "Invalid contribution status" };
  }

  if (!VALID_PAYMENT_MODES.has(body.paymentMode)) {
    return { error: "Invalid payment mode" };
  }

  if (!Number.isFinite(amount) || amount < 0) {
    return { error: "Amount must be zero or more" };
  }

  if (status === "paid" && amount <= 0) {
    return { error: "Paid contributions must have an amount greater than 0" };
  }

  if (status !== "paid") {
    if (!Number.isFinite(expectedAmount) || expectedAmount <= 0) {
      return { error: "Expected amount must be greater than 0" };
    }
    if (status === "pending" && amount !== 0) {
      return { error: "Pending contributions cannot have a received amount" };
    }
    if (status === "partial" && amount <= 0) {
      return { error: "Partial contributions need a received amount" };
    }
    if (amount >= expectedAmount) {
      return {
        error:
          "Received amount must be less than expected amount unless fully paid",
      };
    }
  }

  const contributor = await Contributor.findOne({
    _id: body.contributorId,
    eventId,
  });
  if (!contributor) {
    return { error: "Contributor does not belong to this event" };
  }

  return {
    value: {
      eventId,
      contributorId: body.contributorId,
      amount,
      paymentMode: body.paymentMode,
      date: body.date,
      referenceId: body.referenceId || undefined,
      note: body.note || "",
      status,
      expectedAmount: status !== "paid" ? expectedAmount : undefined,
    },
  };
};

// GET /api/contributions?eventId=&status=&mode=&from=&to=
exports.getContributions = async (req, res) => {
  try {
    if (!req.query.eventId || !isValidObjectId(req.query.eventId)) {
      return res.status(400).json({ message: "Valid eventId is required" });
    }
    const builtFilter = buildFilter(req.query);
    if (builtFilter.error) {
      return res.status(400).json({ message: builtFilter.error });
    }
    const contributions = await Contribution.find(builtFilter.value)
      .populate("contributorId", "name phone")
      .sort({ date: -1 });
    res.json(contributions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/contributions
exports.createContribution = async (req, res) => {
  try {
    const normalized = await normalizeContributionPayload(req.body);
    if (normalized.error) {
      return res.status(400).json({ message: normalized.error });
    }

    const contribution = await Contribution.create(normalized.value);
    await contribution.populate("contributorId", "name phone");
    res.status(201).json(contribution);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/contributions/:id
exports.updateContribution = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res
        .status(400)
        .json({ message: "Valid contribution id is required" });
    }

    const contribution = await Contribution.findById(req.params.id);
    if (!contribution) {
      return res.status(404).json({ message: "Contribution not found" });
    }

    const merged = {
      ...contribution.toObject(),
      ...req.body,
      eventId: contribution.eventId.toString(),
    };
    const normalized = await normalizeContributionPayload(
      merged,
      contribution.eventId,
    );
    if (normalized.error) {
      return res.status(400).json({ message: normalized.error });
    }

    Object.assign(contribution, normalized.value);
    await contribution.save();
    await contribution.populate("contributorId", "name phone");
    res.json(contribution);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/contributions/:id
exports.deleteContribution = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res
        .status(400)
        .json({ message: "Valid contribution id is required" });
    }

    const contribution = await Contribution.findByIdAndDelete(req.params.id);
    if (!contribution) {
      return res.status(404).json({ message: "Contribution not found" });
    }
    res.json({ message: "Contribution deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
