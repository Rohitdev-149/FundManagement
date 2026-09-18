import RoleGate from "../shared/RoleGate";
import { formatCurrency } from "../../utils/format";

const CategoryCard = ({ category, spent, onEdit }) => {
  const budget = Number(category.budget || 0);
  const spentAmount = Number(spent || 0);
  const percent = budget > 0 ? Math.min((spentAmount / budget) * 100, 100) : 0;
  const overBudget = spentAmount > budget && budget > 0;

  return (
    <div className="card">
      <div className="flex justify-between items-start gap-3 mb-3">
        <div className="min-w-0">
          <p className="truncate font-semibold text-sm">
            {category.icon || "\u{1F4E6}"} {category.name}
          </p>
          <p className="text-xs text-gray-500">
            {formatCurrency(spentAmount)} of {formatCurrency(budget)}
          </p>
        </div>
        <RoleGate allow={["admin", "treasurer"]}>
          <button
            onClick={() => onEdit(category)}
            className="edit-action shrink-0"
          >
            Edit
          </button>
        </RoleGate>
      </div>

      <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
        <div
          className={`h-2 rounded-full ${overBudget ? "bg-red-500" : "bg-green-500"}`}
          style={{ width: `${percent}%` }}
        />
      </div>

      {overBudget && (
        <p className="text-red-600 text-xs mt-2">
          Warning: Exceeded by {formatCurrency(spentAmount - budget)}
        </p>
      )}
    </div>
  );
};

export default CategoryCard;
