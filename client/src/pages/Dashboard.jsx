import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/authContext";
import { useNavigate } from "react-router-dom";
import { useEvent } from "../context/eventContext";
import {
  getDashboard,
  getCategoryWiseReport,
  getDateWiseReport,
  getBudgetVsActual,
} from "../api/dashboardApi";
import {
  StatCard,
  EmptyState,
  Button,
  Badge,
  SkeletonDashboard,
} from "../components/ui";
import IncomeExpenseBar from "../components/reports/IncomeExpenseBar";
import CashUpiPie from "../components/reports/CashUpiPie";
import CategoryPieChart from "../components/reports/CategoryPieChart";
import DateTrendChart from "../components/reports/DateTrendChart";
import BudgetVsActualChart from "../components/reports/BudgetVsActualChart";
import { formatCurrency } from "../utils/format";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    currentEvent,
    events,
    selectEvent,
    loading: eventsLoading,
  } = useEvent();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [recentContributions, setRecentContributions] = useState([]);
  const [recentExpenses, setRecentExpenses] = useState([]);

  const fetchStats = useCallback(async () => {
    if (!currentEvent) {
      setStats(null);
      setRecentContributions([]);
      setRecentExpenses([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");
    try {
      const [
        dashboardResponse,
        categoryResponse,
        dateResponse,
        budgetResponse,
      ] = await Promise.all([
        getDashboard(currentEvent._id),
        getCategoryWiseReport(currentEvent._id),
        getDateWiseReport(currentEvent._id),
        getBudgetVsActual(currentEvent._id),
      ]);
      const data = dashboardResponse.data;
      setStats({
        ...data,
        categoryBreakdown: categoryResponse.data,
        ...dateResponse.data,
        budgetVsActual: budgetResponse.data,
      });
      setRecentContributions(data.recentContributions || []);
      setRecentExpenses(data.recentExpenses || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  }, [currentEvent]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  if (eventsLoading) {
    return <SkeletonDashboard />;
  }

  if (!currentEvent) {
    return (
      <div className="page-shell">
        <EmptyState
          title="No Event Selected"
          description="Please select an event from the sidebar or ask an admin to create one."
          illustration={
            <svg
              className="size-16 text-[var(--color-text-tertiary)]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          }
        />
      </div>
    );
  }

  const balance = stats?.balance || 0;
  const totalCollection = stats?.totalCollection || 0;
  const totalExpense = stats?.totalExpense || 0;
  const totalPending = stats?.totalPending || 0;
  const cashInHand = stats?.cashInHand || 0;
  const upiBankBalance = stats?.upiBankBalance || 0;

  return (
    <div className="page-shell">
      <div className="page-header">
        <div className="min-w-0">
          <h1 className="page-title truncate">{currentEvent.name}</h1>
          <p className="page-subtitle">
            Welcome back, {user?.name}{" "}
            <span className="text-[var(--color-primary)]">•</span> {user?.role}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {events.length > 1 && (
            <select
              value={currentEvent._id}
              onChange={(e) =>
                selectEvent(
                  events.find((event) => event._id === e.target.value),
                )
              }
              className="form-input form-select py-2 px-3 text-sm hidden sm:block"
              aria-label="Select event"
            >
              {events.map((event) => (
                <option key={event._id} value={event._id}>
                  {event.name}
                </option>
              ))}
            </select>
          )}
        </div>
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
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <SkeletonDashboard />
      ) : stats ? (
        <>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 mb-6">
            <StatCard
              label="Total Collection"
              value={formatCurrency(totalCollection)}
              icon={
                <svg
                  className="size-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              }
              iconBg="success"
            />
            <StatCard
              label="Total Expenses"
              value={formatCurrency(totalExpense)}
              icon={
                <svg
                  className="size-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              }
              iconBg="error"
              tone="negative"
            />
            <StatCard
              label="Balance"
              value={formatCurrency(balance)}
              icon={
                <svg
                  className="size-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              }
              iconBg={balance >= 0 ? "success" : "error"}
              tone={balance >= 0 ? "positive" : "negative"}
            />
            <StatCard
              label="Pending"
              value={formatCurrency(totalPending)}
              icon={
                <svg
                  className="size-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              }
              iconBg="warning"
              tone="warning"
              action={() => navigate("/pending")}
              actionLabel="View all"
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 mb-6">
            <StatCard
              label="Cash in Hand"
              value={formatCurrency(cashInHand)}
              icon={
                <svg
                  className="size-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              }
              iconBg="primary"
            />
            <StatCard
              label="UPI/Bank Balance"
              value={formatCurrency(upiBankBalance)}
              icon={
                <svg
                  className="size-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                  />
                </svg>
              }
              iconBg="secondary"
            />
          </div>

          <div className="card mb-6">
            <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">
              Quick Actions
            </h2>
            <div className="quick-actions">
              <Button
                variant="ghost"
                className="quick-action"
                onClick={() => navigate("/contributions?new=true")}
              >
                <div className="quick-action-icon">
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
                </div>
                <span className="quick-action-label">Add Contribution</span>
              </Button>
              <Button
                variant="ghost"
                className="quick-action"
                onClick={() => navigate("/expenses?new=true")}
              >
                <div className="quick-action-icon">
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
                      d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
                <span className="quick-action-label">Add Expense</span>
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
            <section className="chart-container">
              <h2 className="chart-title">Income vs Expense</h2>
              <div className="chart-wrapper">
                <IncomeExpenseBar
                  totalCollection={totalCollection}
                  totalExpense={totalExpense}
                />
              </div>
            </section>

            <section className="chart-container">
              <h2 className="chart-title">Cash vs UPI/Bank</h2>
              <div className="chart-wrapper">
                <CashUpiPie
                  cashInHand={cashInHand}
                  upiBankBalance={upiBankBalance}
                />
              </div>
            </section>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
            <section className="chart-container">
              <h2 className="chart-title">Category-wise Expenses</h2>
              <div className="chart-wrapper">
                <CategoryPieChart data={stats.categoryBreakdown || []} />
              </div>
            </section>

            <section className="chart-container">
              <h2 className="chart-title">Date-wise Trend</h2>
              <div className="chart-wrapper">
                <DateTrendChart
                  contributionsByDate={stats.contributionsByDate || []}
                  expensesByDate={stats.expensesByDate || []}
                />
              </div>
            </section>
          </div>

          <section className="chart-container mb-6">
            <h2 className="chart-title">Budget vs Actual</h2>
            <div className="chart-wrapper">
              <BudgetVsActualChart data={stats.budgetVsActual || []} />
            </div>
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
            <section className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
                  Recent Contributions
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/contributions")}
                >
                  View All
                </Button>
              </div>
              {recentContributions.length === 0 ? (
                <EmptyState
                  size="sm"
                  title="No contributions yet"
                  description="Start by recording your first contribution."
                />
              ) : (
                <div className="space-y-2">
                  {recentContributions.slice(0, 5).map((contribution) => (
                    <div
                      key={contribution._id}
                      className="list-card mobile-row"
                    >
                      <div className="row-main">
                        <p className="font-medium text-sm truncate">
                          {contribution.contributorId?.name || "Unknown"}
                        </p>
                        <p className="text-xs text-[var(--color-text-tertiary)]">
                          {contribution.paymentMode?.toUpperCase()} •{" "}
                          {new Date(contribution.date).toLocaleDateString(
                            "en-IN",
                          )}
                        </p>
                      </div>
                      <div className="row-actions">
                        <span className="font-bold text-[var(--color-success)]">
                          {formatCurrency(contribution.amount)}
                        </span>
                        <Badge
                          variant={
                            contribution.status === "paid"
                              ? "success"
                              : contribution.status === "partial"
                                ? "warning"
                                : "neutral"
                          }
                          size="sm"
                        >
                          {contribution.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
                  Recent Expenses
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/expenses")}
                >
                  View All
                </Button>
              </div>
              {recentExpenses.length === 0 ? (
                <EmptyState
                  size="sm"
                  title="No expenses yet"
                  description="Start by recording your first expense."
                />
              ) : (
                <div className="space-y-2">
                  {recentExpenses.slice(0, 5).map((expense) => (
                    <div key={expense._id} className="list-card mobile-row">
                      <div className="row-main">
                        <p className="font-medium text-sm truncate">
                          {expense.categoryId?.icon || "📦"} {expense.name}
                        </p>
                        <p className="text-xs text-[var(--color-text-tertiary)]">
                          {expense.paymentMode?.toUpperCase()} •{" "}
                          {new Date(expense.date).toLocaleDateString("en-IN")}
                        </p>
                      </div>
                      <div className="row-actions">
                        <span className="font-bold text-[var(--color-error)]">
                          {formatCurrency(expense.amount)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          <div className="card">
            <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">
              Event Summary
            </h2>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="p-3 rounded-xl bg-[var(--color-surface-hover)]">
                <p className="text-2xl font-bold text-[var(--color-text-primary)]">
                  {stats.expenseCount || 0}
                </p>
                <p className="text-xs text-[var(--color-text-tertiary)]">
                  Expenses
                </p>
              </div>
              <div className="p-3 rounded-xl bg-[var(--color-surface-hover)]">
                <p className="text-2xl font-bold text-[var(--color-text-primary)]">
                  {stats.categoryCount || 0}
                </p>
                <p className="text-xs text-[var(--color-text-tertiary)]">
                  Categories
                </p>
              </div>
            </div>
          </div>
        </>
      ) : (
        <EmptyState
          title="No Data Available"
          description="Unable to load dashboard data. Please try again later."
        />
      )}
    </div>
  );
};

export default Dashboard;
