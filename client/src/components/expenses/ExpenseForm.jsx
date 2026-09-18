import { useState, useEffect, useMemo } from "react";
import { createExpense, updateExpense } from "../../api/expenseApi";
import { formatCurrency } from "../../utils/format";

const ExpenseForm = ({
  eventId,
  categories,
  expenses,
  editingExpense,
  onSaved,
  onCancel,
}) => {
  const [categoryId, setCategoryId] = useState("");
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [vendor, setVendor] = useState("");
  const [paymentMode, setPaymentMode] = useState("upi");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (editingExpense) {
      setCategoryId(editingExpense.categoryId?._id || editingExpense.categoryId);
      setName(editingExpense.name || "");
      setAmount(String(editingExpense.amount ?? ""));
      setVendor(editingExpense.vendor || "");
      setPaymentMode(editingExpense.paymentMode || "upi");
      setDate(editingExpense.date?.slice(0, 10) || "");
      setNote(editingExpense.note || "");
    }
  }, [editingExpense]);

  const budgetWarning = useMemo(() => {
    const nextAmount = Number(amount);
    if (!categoryId || !Number.isFinite(nextAmount) || nextAmount <= 0) {
      return null;
    }

    const category = categories.find((item) => item._id === categoryId);
    if (!category || !category.budget) return null;

    const alreadySpent = expenses
      .filter((expense) => (expense.categoryId?._id || expense.categoryId) === categoryId)
      .filter((expense) => !editingExpense || expense._id !== editingExpense._id)
      .reduce((sum, expense) => sum + Number(expense.amount || 0), 0);

    const projectedTotal = alreadySpent + nextAmount;
    if (projectedTotal > category.budget) {
      return `${category.name} budget exceeded by ${formatCurrency(
        projectedTotal - category.budget,
      )}`;
    }
    return null;
  }, [categoryId, amount, categories, expenses, editingExpense]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const parsedAmount = Number(amount);
    if (!categoryId) {
      setError("Select a category");
      return;
    }
    if (!name.trim()) {
      setError("Expense name is required");
      return;
    }
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setError("Amount must be greater than 0");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        eventId,
        categoryId,
        name: name.trim(),
        amount: parsedAmount,
        vendor: vendor.trim(),
        paymentMode,
        date,
        note: note.trim(),
      };
      if (editingExpense) {
        await updateExpense(editingExpense._id, payload);
      } else {
        await createExpense(payload);
      }
      onSaved();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save expense");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="form-card space-y-3"
    >
      <label className="block text-sm font-medium text-gray-700">
        Category
      </label>
      <select
        value={categoryId}
        onChange={(e) => setCategoryId(e.target.value)}
        className="text-input"
      >
        <option value="">-- Select category --</option>
        {categories.map((category) => (
          <option key={category._id} value={category._id}>
            {category.icon || "\u{1F4E6}"} {category.name}
          </option>
        ))}
      </select>

      <label className="block text-sm font-medium text-gray-700">
        Expense Name
      </label>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        className="text-input"
      />

      <label className="block text-sm font-medium text-gray-700">Amount</label>
      <input
        type="number"
        min="0"
        step="0.01"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        required
        className="text-input"
      />

      {budgetWarning && (
        <p className="text-amber-600 text-sm bg-amber-50 rounded-lg px-3 py-2">
          Warning: {budgetWarning}
        </p>
      )}

      <label className="block text-sm font-medium text-gray-700">
        Paid To / Vendor
      </label>
      <input
        type="text"
        value={vendor}
        onChange={(e) => setVendor(e.target.value)}
        className="text-input"
      />

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
          {saving ? "Saving..." : editingExpense ? "Update" : "Add Expense"}
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

export default ExpenseForm;
