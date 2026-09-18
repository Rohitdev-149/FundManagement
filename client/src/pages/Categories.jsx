import { useState, useEffect, useCallback } from "react";
import { useEvent } from "../context/eventContext";
import { getCategories } from "../api/categoryApi";
import { getExpenses } from "../api/expenseApi";
import CategoryForm from "../components/expenses/CategoryForm";
import CategoryCard from "../components/expenses/CategoryCard";
import RoleGate from "../components/shared/RoleGate";

const Categories = () => {
  const { currentEvent } = useEvent();
  const [categories, setCategories] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
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
      setError(err.response?.data?.message || "Failed to load categories");
    } finally {
      setLoading(false);
    }
  }, [currentEvent]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const spentFor = (categoryId) =>
    expenses
      .filter((expense) => (expense.categoryId?._id || expense.categoryId) === categoryId)
      .reduce((sum, expense) => sum + Number(expense.amount || 0), 0);

  const handleSaved = () => {
    setShowForm(false);
    setEditingCategory(null);
    loadData();
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setShowForm(true);
  };

  if (!currentEvent) {
    return <div className="page-shell text-gray-500">Select an event first.</div>;
  }

  return (
    <div className="page-shell">
      <div className="page-header">
        <div>
          <h1 className="page-title">Categories & Budgets</h1>
          <p className="page-subtitle">Plan limits and watch spending.</p>
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
          <CategoryForm
            eventId={currentEvent._id}
            editingCategory={editingCategory}
            onSaved={handleSaved}
            onCancel={() => {
              setShowForm(false);
              setEditingCategory(null);
            }}
          />
        </div>
      )}

      {loading ? (
        <p className="text-gray-500 text-sm">Loading...</p>
      ) : categories.length === 0 ? (
        <p className="text-gray-400 text-sm text-center py-6">
          No categories yet.
        </p>
      ) : (
        <div className="space-y-3">
          {categories.map((category) => (
            <CategoryCard
              key={category._id}
              category={category}
              spent={spentFor(category._id)}
              onEdit={handleEdit}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Categories;
