import { useState, useEffect } from "react";
import { getContributorHistory } from "../../api/contributorApi";
import { formatCurrency, formatDate, joinDetails } from "../../utils/format";

const ContributorHistoryModal = ({ contributor, onClose }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const { data } = await getContributorHistory(contributor._id);
        if (!ignore) setHistory(data);
      } catch (err) {
        if (!ignore) {
          setError(
            err.response?.data?.message || "Failed to load contribution history",
          );
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    load();
    return () => {
      ignore = true;
    };
  }, [contributor]);

  const total = history.reduce(
    (sum, contribution) => sum + Number(contribution.amount || 0),
    0,
  );

  return (
    <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50">
      <div className="w-full max-h-[82vh] overflow-y-auto rounded-t-3xl bg-white p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] shadow-xl sm:max-w-md sm:rounded-2xl">
        <div className="flex justify-between items-center mb-3">
          <h2 className="font-bold text-lg">{contributor.name}</h2>
          <button
            onClick={onClose}
            className="secondary-action h-11 w-11 px-0 text-xl leading-none"
          >
            &times;
          </button>
        </div>

        {contributor.phone && (
          <p className="text-xs text-gray-500 mb-3">{contributor.phone}</p>
        )}

        {loading ? (
          <p className="text-sm text-gray-500">Loading...</p>
        ) : error ? (
          <p className="text-sm text-red-500">{error}</p>
        ) : history.length === 0 ? (
          <p className="text-sm text-gray-400">
            No contributions recorded yet.
          </p>
        ) : (
          <>
            <div className="space-y-2 mb-3">
              {history.map((contribution) => (
                <div
                  key={contribution._id}
                  className="flex flex-col gap-1 border-b pb-2 text-sm min-[380px]:flex-row min-[380px]:justify-between"
                >
                  <span className="text-gray-600">
                    {joinDetails(
                      formatDate(contribution.date),
                      contribution.paymentMode?.toUpperCase(),
                      contribution.status !== "paid" && contribution.status,
                    )}
                  </span>
                  <span className="font-semibold text-green-600">
                    {formatCurrency(contribution.amount)}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex justify-between font-bold pt-1 border-t">
              <span>Total</span>
              <span className="text-orange-600">{formatCurrency(total)}</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ContributorHistoryModal;
