import { useState, useEffect, useCallback } from "react";
import { useEvent } from "../context/eventContext";
import { getContributors } from "../api/contributorApi";
import { getContributions, deleteContribution } from "../api/contributionApi";
import ContributionForm from "../components/contributions/ContributionForm";
import ContributionList from "../components/contributions/ContributionList";
import RoleGate from "../components/shared/RoleGate";
import {
  Button,
  Card,
  Badge,
  EmptyState,
  LoadingSkeleton,
  Input,
  Select,
} from "../components/ui";
import { formatCurrency } from "../utils/format";

const Contributions = () => {
  const { currentEvent } = useEvent();
  const [contributors, setContributors] = useState([]);
  const [contributions, setContributions] = useState([]);
  const [filteredContributions, setFilteredContributions] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingContribution, setEditingContribution] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [modeFilter, setModeFilter] = useState("all");

  const loadData = useCallback(async () => {
    if (!currentEvent) {
      setContributors([]);
      setContributions([]);
      setFilteredContributions([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");
    try {
      const [contributorsRes, contributionsRes] = await Promise.all([
        getContributors(currentEvent._id),
        getContributions(currentEvent._id),
      ]);
      setContributors(contributorsRes.data);
      setContributions(contributionsRes.data);
      setFilteredContributions(contributionsRes.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load contributions");
    } finally {
      setLoading(false);
    }
  }, [currentEvent]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    let filtered = contributions;
    if (search.trim()) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.contributorId?.name?.toLowerCase().includes(searchLower) ||
          c.note?.toLowerCase().includes(searchLower) ||
          formatCurrency(c.amount).includes(search),
      );
    }
    if (statusFilter !== "all") {
      filtered = filtered.filter((c) => c.status === statusFilter);
    }
    if (modeFilter !== "all") {
      filtered = filtered.filter((c) => c.paymentMode === modeFilter);
    }
    setFilteredContributions(filtered);
  }, [contributions, search, statusFilter, modeFilter]);

  const handleSaved = () => {
    setShowForm(false);
    setEditingContribution(null);
    loadData();
  };

  const handleEdit = (contribution) => {
    setEditingContribution(contribution);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this contribution?")) return;
    setError("");
    try {
      await deleteContribution(id, currentEvent._id);
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete contribution");
    }
  };

  if (!currentEvent) {
    return (
      <div className="page-shell">
        <EmptyState
          title="Select an Event"
          description="Please select an event from the sidebar to view contributions."
        />
      </div>
    );
  }

  const stats = {
    paid: contributions
      .filter((c) => c.status === "paid")
      .reduce((sum, c) => sum + Number(c.amount || 0), 0),
    partial: contributions.filter((c) => c.status === "partial").length,
    pending: contributions.filter((c) => c.status === "pending").length,
  };

  return (
    <div className="page-shell">
      <div className="page-header">
        <div>
          <h1 className="page-title">Contributions</h1>
          <p className="page-subtitle">
            Received, partial, and pending entries
          </p>
        </div>
        <RoleGate allow={["admin", "treasurer"]}>
          {!showForm && (
            <Button
              onClick={() => setShowForm(true)}
              leftIcon={
                <svg
                  className="size-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
              }
            >
              Add Contribution
            </Button>
          )}
        </RoleGate>
      </div>

      {error && (
        <div
          className="flex items-center gap-2 p-3 rounded-xl bg-[var(--color-error-light)] text-[var(--color-error)] text-sm mb-4"
          role="alert"
        >
          <svg
            className="size-5 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 001.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
          <span>{error}</span>
        </div>
      )}

      <Card className="mb-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <Input
            placeholder="Search contributions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1"
            leftIcon={
              <svg
                className="size-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            }
          />
          <Select
            options={[
              { value: "all", label: "All Status" },
              { value: "paid", label: "Paid" },
              { value: "partial", label: "Partial" },
              { value: "pending", label: "Pending" },
            ]}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-40"
          />
          <Select
            options={[
              { value: "all", label: "All Modes" },
              { value: "cash", label: "Cash" },
              { value: "upi", label: "UPI" },
              { value: "bank", label: "Bank" },
              { value: "other", label: "Other" },
            ]}
            value={modeFilter}
            onChange={(e) => setModeFilter(e.target.value)}
            className="w-full sm:w-40"
          />
        </div>
      </Card>

      <div
        className="flex flex-wrap gap-2 mb-4"
        role="status"
        aria-live="polite"
      >
        <Badge variant="success">
          {stats.paid > 0 ? formatCurrency(stats.paid) : "0"} Paid
        </Badge>
        <Badge variant="warning">{stats.partial} Partial</Badge>
        <Badge variant="neutral">{stats.pending} Pending</Badge>
      </div>

      {showForm && (
        <Card className="mb-4">
          <ContributionForm
            eventId={currentEvent._id}
            contributors={contributors}
            editingContribution={editingContribution}
            onSaved={handleSaved}
            onCancel={() => {
              setShowForm(false);
              setEditingContribution(null);
            }}
          />
        </Card>
      )}

      {loading ? (
        <div
          className="space-y-2"
          aria-busy="true"
          aria-label="Loading contributions"
        >
          {[...Array(5)].map((_, i) => (
            <LoadingSkeleton key={i} variant="row" />
          ))}
        </div>
      ) : filteredContributions.length === 0 ? (
        <EmptyState
          title={
            search || statusFilter !== "all" || modeFilter !== "all"
              ? "No matches found"
              : "No contributions yet"
          }
          description={
            search || statusFilter !== "all" || modeFilter !== "all"
              ? "Try adjusting your search or filters."
              : "Add your first contribution to get started."
          }
          action={
            !search && statusFilter === "all" && modeFilter === "all"
              ? () => setShowForm(true)
              : undefined
          }
          actionLabel="Add Contribution"
        />
      ) : (
        <ContributionList
          contributions={filteredContributions}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
};

export default Contributions;
