import { useState, useEffect, useCallback } from "react";
import { useEvent } from "../context/eventContext";
import { getContributions, updateContribution } from "../api/contributionApi";
import RoleGate from "../components/shared/RoleGate";
import { formatCurrency } from "../utils/format";

const outstandingFor = (contribution) =>
  Math.max(
    Number(contribution.expectedAmount || 0) - Number(contribution.amount || 0),
    0,
  );

const PendingContributions = () => {
  const { currentEvent } = useEvent();
  const [pending, setPending] = useState([]);
  const [partial, setPartial] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = useCallback(async () => {
    if (!currentEvent) {
      setPending([]);
      setPartial([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");
    try {
      const [pendingRes, partialRes] = await Promise.all([
        getContributions(currentEvent._id, { status: "pending" }),
        getContributions(currentEvent._id, { status: "partial" }),
      ]);
      setPending(pendingRes.data);
      setPartial(partialRes.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load contributions");
    } finally {
      setLoading(false);
    }
  }, [currentEvent]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleMarkPaid = async (contribution) => {
    if (
      !confirm(
        `Mark ${formatCurrency(contribution.expectedAmount)} from ${
          contribution.contributorId?.name || "this contributor"
        } as fully paid?`,
      )
    ) {
      return;
    }

    setError("");
    try {
      await updateContribution(contribution._id, {
        status: "paid",
        amount: contribution.expectedAmount,
      });
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update contribution");
    }
  };

  const totalOutstanding = [...pending, ...partial].reduce(
    (sum, contribution) => sum + outstandingFor(contribution),
    0,
  );

  if (!currentEvent) {
    return (
      <div className="page-shell text-gray-500">Select an event first.</div>
    );
  }

  const renderRow = (contribution) => (
    <div key={contribution._id} className="list-card mobile-row">
      <div className="row-main">
        <p className="font-semibold text-sm">
          {contribution.contributorId?.name || "Unknown"}
        </p>
        <p className="text-xs text-gray-500">
          {contribution.status === "partial"
            ? `${formatCurrency(contribution.amount)} received of ${formatCurrency(
                contribution.expectedAmount,
              )}`
            : `${formatCurrency(contribution.expectedAmount)} promised, nothing received`}
        </p>
      </div>
      <div className="row-actions">
        <span className="font-bold text-amber-600">
          {formatCurrency(outstandingFor(contribution))}
        </span>
        <RoleGate allow={["admin", "treasurer"]}>
          <button
            onClick={() => handleMarkPaid(contribution)}
            className="success-action"
          >
            Mark Paid
          </button>
        </RoleGate>
      </div>
    </div>
  );

  return (
    <div className="page-shell">
      <h1 className="page-title">Pending Contributions</h1>
      <p className="text-sm text-gray-500 mb-4">
        Total outstanding:{" "}
        <span className="font-bold text-amber-600">
          {formatCurrency(totalOutstanding)}
        </span>
      </p>

      {error && (
        <p className="text-red-500 text-sm bg-red-50 rounded-lg px-3 py-2 mb-3">
          {error}
        </p>
      )}

      {loading ? (
        <p className="text-gray-500 text-sm">Loading...</p>
      ) : pending.length === 0 && partial.length === 0 ? (
        <p className="text-gray-400 text-sm text-center py-6">
          Nothing pending.
        </p>
      ) : (
        <div className="space-y-4">
          {pending.length > 0 && (
            <div>
              <h2 className="text-xs font-semibold text-gray-500 uppercase mb-2">
                Pending ({pending.length})
              </h2>
              <div className="space-y-2">{pending.map(renderRow)}</div>
            </div>
          )}
          {partial.length > 0 && (
            <div>
              <h2 className="text-xs font-semibold text-gray-500 uppercase mb-2">
                Partially Paid ({partial.length})
              </h2>
              <div className="space-y-2">{partial.map(renderRow)}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PendingContributions;
