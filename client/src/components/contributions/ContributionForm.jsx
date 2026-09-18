import { useState, useEffect } from "react";
import { createContributor } from "../../api/contributorApi";
import {
  createContribution,
  updateContribution,
} from "../../api/contributionApi";

const ContributionForm = ({
  eventId,
  contributors,
  editingContribution,
  onSaved,
  onCancel,
}) => {
  const [contributorId, setContributorId] = useState("");
  const [newContributorName, setNewContributorName] = useState("");
  const [amount, setAmount] = useState("");
  const [expectedAmount, setExpectedAmount] = useState("");
  const [status, setStatus] = useState("paid");
  const [paymentMode, setPaymentMode] = useState("upi");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (editingContribution) {
      setContributorId(
        editingContribution.contributorId?._id ||
          editingContribution.contributorId,
      );
      setAmount(String(editingContribution.amount ?? ""));
      setExpectedAmount(String(editingContribution.expectedAmount ?? ""));
      setStatus(editingContribution.status || "paid");
      setPaymentMode(editingContribution.paymentMode || "upi");
      setDate(editingContribution.date?.slice(0, 10) || "");
      setNote(editingContribution.note || "");
    }
  }, [editingContribution]);

  const validateAmounts = () => {
    const receivedAmount = status === "pending" ? 0 : Number(amount);
    const promisedAmount = status === "paid" ? undefined : Number(expectedAmount);

    if (!Number.isFinite(receivedAmount) || receivedAmount < 0) {
      return { error: "Amount must be zero or more" };
    }

    if (status === "paid" && receivedAmount <= 0) {
      return { error: "Paid contributions must have an amount greater than 0" };
    }

    if (status !== "paid") {
      if (!Number.isFinite(promisedAmount) || promisedAmount <= 0) {
        return { error: "Expected amount must be greater than 0" };
      }
      if (status === "partial" && receivedAmount <= 0) {
        return { error: "Partial contributions need a received amount" };
      }
      if (receivedAmount >= promisedAmount) {
        return {
          error:
            "Received amount must be less than expected amount unless fully paid",
        };
      }
    }

    return { receivedAmount, promisedAmount };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const amountValidation = validateAmounts();
    if (amountValidation.error) {
      setError(amountValidation.error);
      return;
    }

    setSaving(true);
    try {
      let finalContributorId = contributorId;

      if (!editingContribution && newContributorName.trim()) {
        const { data: newContributor } = await createContributor({
          eventId,
          name: newContributorName.trim(),
        });
        finalContributorId = newContributor._id;
      }

      if (!finalContributorId) {
        setError("Select or enter a contributor");
        setSaving(false);
        return;
      }

      const payload = {
        eventId,
        contributorId: finalContributorId,
        amount: amountValidation.receivedAmount,
        paymentMode,
        date,
        note: note.trim(),
        status,
        expectedAmount:
          status !== "paid" ? amountValidation.promisedAmount : undefined,
      };

      if (editingContribution) {
        await updateContribution(editingContribution._id, payload);
      } else {
        await createContribution(payload);
      }

      onSaved();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save contribution");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="form-card space-y-3"
    >
      {!editingContribution && (
        <>
          <label className="block text-sm font-medium text-gray-700">
            Contributor
          </label>
          <select
            value={contributorId}
            onChange={(e) => setContributorId(e.target.value)}
            className="text-input"
          >
            <option value="">-- Select existing --</option>
            {contributors.map((contributor) => (
              <option key={contributor._id} value={contributor._id}>
                {contributor.name}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-400 text-center">or</p>
          <input
            type="text"
            placeholder="New contributor name"
            value={newContributorName}
            onChange={(e) => setNewContributorName(e.target.value)}
            className="text-input"
          />
        </>
      )}

      <label className="block text-sm font-medium text-gray-700">Status</label>
      <select
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        className="text-input"
      >
        <option value="paid">Paid (money received now)</option>
        <option value="pending">Pending (promised, nothing given yet)</option>
        <option value="partial">Partially paid</option>
      </select>

      {status !== "paid" && (
        <>
          <label className="block text-sm font-medium text-gray-700">
            Expected Amount (Rs.)
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={expectedAmount}
            onChange={(e) => setExpectedAmount(e.target.value)}
            required
            className="text-input"
          />
        </>
      )}

      {status !== "pending" && (
        <>
          <label className="block text-sm font-medium text-gray-700">
            Amount Received
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            className="text-input"
          />
        </>
      )}

      <label className="block text-sm font-medium text-gray-700">
        Payment Mode
      </label>
      <select
        value={paymentMode}
        onChange={(e) => setPaymentMode(e.target.value)}
        className="text-input"
      >
        <option value="cash">Cash</option>
        <option value="upi">UPI</option>
        <option value="bank">Bank</option>
        <option value="other">Other</option>
      </select>

      <label className="block text-sm font-medium text-gray-700">Date</label>
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        required
        className="text-input"
      />

      <label className="block text-sm font-medium text-gray-700">
        Note (optional)
      </label>
      <input
        type="text"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        className="text-input"
      />

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <div className="flex gap-2 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="primary-action flex-1"
        >
          {saving
            ? "Saving..."
            : editingContribution
              ? "Update"
              : "Add Contribution"}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="secondary-action"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
};

export default ContributionForm;
