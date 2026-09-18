import { forwardRef } from "react";

const StatCard = forwardRef(
  (
    {
      label,
      value,
      icon,
      iconBg = "primary",
      trend,
      trendLabel,
      className = "",
      tone = "default",
      loading = false,
      action,
      actionLabel,
    },
    ref
  ) => {
    const toneClasses = {
      default: "text-[var(--color-text-primary)]",
      positive: "text-[var(--color-success)]",
      negative: "text-[var(--color-error)]",
      warning: "text-[var(--color-warning)]",
    };

    const iconBgClasses = {
      primary: "bg-[var(--color-primary-light)] text-[var(--color-primary)]",
      success: "bg-[var(--color-success-light)] text-[var(--color-success)]",
      warning: "bg-[var(--color-warning-light)] text-[var(--color-warning)]",
      error: "bg-[var(--color-error-light)] text-[var(--color-error)]",
      secondary: "bg-[var(--color-secondary-light)] text-[var(--color-secondary)]",
    };

    const trendClasses = {
      positive: "stat-card-trend-positive",
      negative: "stat-card-trend-negative",
      neutral: "stat-card-trend-neutral",
    };

    if (loading) {
      return (
        <div ref={ref} className={`stat-card ${className}`} aria-busy="true">
          <div className="skeleton animate-pulse h-4 w-1/3 rounded mb-1" />
          <div className="skeleton animate-pulse h-8 w-3/4 rounded" />
          {trend && <div className="skeleton animate-pulse h-4 w-1/2 rounded mt-2" />}
        </div>
      );
    }

    return (
      <div ref={ref} className={`stat-card ${className}`}>
        {icon && (
          <div className={`stat-card-icon ${iconBgClasses[iconBg]}`} aria-hidden="true">
            {icon}
          </div>
        )}
        <p className="text-xs font-medium text-[var(--color-text-secondary)] mb-1">{label}</p>
        <p className={`text-2xl sm:text-3xl font-bold leading-tight ${toneClasses[tone]}`}>
          {value}
        </p>
        {(trend || action) && (
          <div className="flex items-center justify-between mt-3">
            {trend && (
              <div className={`stat-card-trend ${trendClasses[trend.type] || "stat-card-trend-neutral"}`}>
                {trend.type === "positive" && (
                  <svg className="size-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                  </svg>
                )}
                {trend.type === "negative" && (
                  <svg className="size-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                )}
                {trend.type === "neutral" && (
                  <svg className="size-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" />
                  </svg>
                )}
                <span>{trend.value}</span>
                {trendLabel && <span className="text-[var(--color-text-tertiary)]">{trendLabel}</span>}
              </div>
            )}
            {action && actionLabel && (
              <button
                onClick={action}
                className="text-sm font-medium text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] transition-colors"
              >
                {actionLabel}
              </button>
            )}
          </div>
        )}
      </div>
    );
  }
);

StatCard.displayName = "StatCard";

export default StatCard;