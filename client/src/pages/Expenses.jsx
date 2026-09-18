import { useState, useEffect, useCallback } from "react";
import { useEvent } from "../context/eventContext";
import { getCategories } from "../api/categoryApi";
import { getExpenses, deleteExpense } from "../api/expenseApi";
import ExpenseForm from "../components/expenses/ExpenseForm";
import ExpenseList from "../components/expenses/ExpenseList";
import RoleGate from "../components/shared/RoleGate";

const Expenses = () => {
  const { currentEvent } = useEvent();
  const [categories, setCategories] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = useCallback(async () => {
    if (!currentEvent) {
      setCategories([]);
      setExpenses([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");
    try {
      const [categoriesRes, expensesRes] = await Promise.all([
        getCategories(currentEvent._id),
        getExpenses(currentEvent._id),
      ]);
      setCategories(categoriesRes.data);
      setExpenses(expensesRes.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load expenses");
    } finally {
      setLoading(false);
    }
  }, [currentEvent]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSaved = () => {
    setShowForm(false);
    setEditingExpense(null);
    loadData();
  };

  const handleEdit = (expense) => {
    setEditingExpense(expense);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this expense?")) return;
    setError("");
    try {
      await deleteExpense(id);
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete expense");
    }
  };

  if (!currentEvent) {
    return <div className="page-shell text-gray-500">Select an event first.</div>;
  }

  if (!loading && categories.length === 0) {
    return (
      <div className="page-shell text-center text-gray-500">
        No categories yet. Create a category first (Categories page) before
        adding expenses.
      </div>
    );
  }

  return (
    <div className="page-shell">
      <div className="page-header">
        <div>
          <h1 className="page-title">Expenses</h1>
          <p className="page-subtitle">Track payments by category and mode.</p>
        </div>
        <RoleGate allow={["admin", "treasurer"]}>
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="primary-action shrink-0"
            >
              + Add
            </button>
          )}
        </RoleGate>
      </div>

      {error && (
        <p className="text-red-500 text-sm bg-red-50 rounded-lg px-3 py-2 mb-3">
          {error}
        </p>
      )}

      {showForm && (
        <div className="mb-4">
          <ExpenseForm
            eventId={currentEvent._id}
            categories={categories}
            expenses={expenses}
            editingExpense={editingExpense}
            onSaved={handleSaved}
            onCancel={() => {
              setShowForm(false);
              setEditingExpense(null);
            }}
          />
        </div>
      )}

      {loading ? (
        <p className="text-gray-500 text-sm">Loading...</p>
      ) : (
        <ExpenseList
          expenses={expenses}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
};

export default Expenses;
