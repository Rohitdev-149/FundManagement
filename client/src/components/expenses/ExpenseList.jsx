import RoleGate from "../shared/RoleGate";

const ExpenseList = ({ expenses, onEdit, onDelete }) => {
  if (expenses.length === 0) {
    return (
      <p className="text-gray-400 text-sm text-center py-6">No expenses yet.</p>
    );
  }

  return (
    <div className="space-y-2">
      {expenses.map((e) => (
        <div
          key={e._id}
          className="bg-white rounded-xl shadow-sm p-3 flex justify-between items-center"
        >
          <div>
            <p className="font-semibold text-sm">
              {e.categoryId?.icon} {e.name}
            </p>
            <p className="text-xs text-gray-500">
              {new Date(e.date).toLocaleDateString("en-IN")} ·{" "}
              {e.paymentMode.toUpperCase()}
              {e.vendor ? ` · ${e.vendor}` : ""}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-bold text-red-600">
              ₹{e.amount.toLocaleString("en-IN")}
            </span>
            <RoleGate allow={["admin", "treasurer"]}>
              <button
                onClick={() => onEdit(e)}
                className="text-xs text-blue-600 underline"
              >
                Edit
              </button>
            </RoleGate>
            <RoleGate allow={["admin"]}>
              <button
                onClick={() => onDelete(e._id)}
                className="text-xs text-red-600 underline"
              >
                Delete
              </button>
            </RoleGate>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ExpenseList;
