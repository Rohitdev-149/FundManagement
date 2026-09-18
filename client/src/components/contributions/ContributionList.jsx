import RoleGate from "../shared/RoleGate";
import { formatCurrency, formatDate, joinDetails } from "../../utils/format";

const ContributionList = ({ contributions, onEdit, onDelete }) => {
  if (contributions.length === 0) {
    return (
      <p className="text-gray-400 text-sm text-center py-6">
        No contributions yet.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {contributions.map((contribution) => (
        <div
          key={contribution._id}
          className="list-card mobile-row"
        >
          <div className="row-main">
            <p className="truncate font-semibold text-sm">
              {contribution.contributorId?.name || "Unknown"}
            </p>
            <p className="text-xs leading-5 text-gray-500">
              {joinDetails(
                formatDate(contribution.date),
                contribution.paymentMode?.toUpperCase(),
                contribution.status !== "paid" && contribution.status,
                contribution.note,
              )}
            </p>
          </div>
          <div className="row-actions">
            <span className="font-bold text-green-600">
              {formatCurrency(contribution.amount)}
            </span>
            <RoleGate allow={["admin", "treasurer"]}>
              <button
                onClick={() => onEdit(contribution)}
                className="edit-action"
              >
                Edit
              </button>
            </RoleGate>
            <RoleGate allow={["admin"]}>
              <button
                onClick={() => onDelete(contribution._id)}
                className="danger-action"
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

export default ContributionList;
