const {
  isMissing,
  isValidObjectId,
  parseDateRange,
  parsePagination,
  parseNumber,
} = require("../utils/validation");
const VALID_STATUSES = new Set(["paid", "pending", "partial"]);
const VALID_PAYMENT_MODES = new Set(["cash", "upi", "bank", "other"]);

const contributorBelongsToEvent = async (models, contributorId) =>
  Boolean(await models.Contributor.exists({ _id: contributorId }));

const filterFor = (query) => {
  const filter = {};
  if (query.status) {
    if (!VALID_STATUSES.has(query.status))
      return { error: "Invalid contribution status filter" };
    filter.status = query.status;
  }
  if (query.mode) {
    if (!VALID_PAYMENT_MODES.has(query.mode))
      return { error: "Invalid payment mode filter" };
    filter.paymentMode = query.mode;
  }
  const range = parseDateRange(query);
  if (range.error) return range;
  if (Object.keys(range.value).length) filter.date = range.value;
  return { value: filter };
};

const normalize = async (body, models) => {
  const status = body.status || "paid";
  let amount = isMissing(body.amount) ? 0 : parseNumber(body.amount);
  const expectedAmount = isMissing(body.expectedAmount)
    ? undefined
    : parseNumber(body.expectedAmount);
  if (!isValidObjectId(body.contributorId))
    return { error: "Valid contributorId is required" };
  if (!VALID_STATUSES.has(status))
    return { error: "Invalid contribution status" };
  if (!VALID_PAYMENT_MODES.has(body.paymentMode))
    return { error: "Invalid payment mode" };
  if (!Number.isFinite(amount) || amount < 0)
    return { error: "Amount must be zero or more" };
  if (status === "pending") amount = 0;
  if (status === "paid" && amount <= 0)
    return { error: "Paid contributions must have an amount greater than 0" };
  if (
    status !== "paid" &&
    (!Number.isFinite(expectedAmount) || expectedAmount <= 0)
  )
    return { error: "Expected amount must be greater than 0" };
  if (status === "pending" && amount !== 0)
    return { error: "Pending contributions cannot have a received amount" };
  if (status === "partial" && amount <= 0)
    return { error: "Partial contributions need a received amount" };
  const normalizedStatus =
    status === "partial" && amount >= expectedAmount ? "paid" : status;
  if (!(await contributorBelongsToEvent(models, body.contributorId)))
    return { error: "Contributor does not belong to this event" };
  return {
    value: {
      contributorId: body.contributorId,
      amount,
      paymentMode: body.paymentMode,
      date: body.date,
      referenceId: body.referenceId || undefined,
      note: body.note || "",
      status: normalizedStatus,
      expectedAmount: normalizedStatus !== "paid" ? expectedAmount : undefined,
    },
  };
};

exports.getContributions = async (req, res) => {
  try {
    const pagination = parsePagination(req.query);
    if (pagination.error)
      return res.status(400).json({ message: pagination.error });
    const filter = filterFor(req.query);
    if (filter.error) return res.status(400).json({ message: filter.error });
    res.json(
      await req.eventModels.Contribution.find(filter.value)
        .populate("contributorId", "name phone")
        .sort({ date: -1 })
        .skip(pagination.value.skip)
        .limit(pagination.value.limit),
    );
  } catch (err) {
    console.error("Contribution request failed:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.createContribution = async (req, res) => {
  try {
    const normalized = await normalize(req.body, req.eventModels);
    if (normalized.error)
      return res.status(400).json({ message: normalized.error });
    const contribution = await req.eventModels.Contribution.create(
      normalized.value,
    );
    await contribution.populate("contributorId", "name phone");
    res.status(201).json(contribution);
  } catch (err) {
    console.error("Contribution request failed:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.updateContribution = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id))
      return res
        .status(400)
        .json({ message: "Valid contribution id is required" });
    const contribution = await req.eventModels.Contribution.findById(
      req.params.id,
    );
    if (!contribution)
      return res.status(404).json({ message: "Contribution not found" });
    const normalized = await normalize(
      { ...contribution.toObject(), ...req.body },
      req.eventModels,
    );
    if (normalized.error)
      return res.status(400).json({ message: normalized.error });
    Object.assign(contribution, normalized.value);
    await contribution.save();
    await contribution.populate("contributorId", "name phone");
    res.json(contribution);
  } catch (err) {
    console.error("Contribution request failed:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.deleteContribution = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id))
      return res
        .status(400)
        .json({ message: "Valid contribution id is required" });
    if (!(await req.eventModels.Contribution.findByIdAndDelete(req.params.id)))
      return res.status(404).json({ message: "Contribution not found" });
    res.status(204).send();
  } catch (err) {
    console.error("Contribution request failed:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};
