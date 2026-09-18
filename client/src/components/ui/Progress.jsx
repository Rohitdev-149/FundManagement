import { forwardRef } from "react";

const Progress = forwardRef(
  (
    {
      value = 0,
      max = 100,
      className = "",
      variant = "default",
      size = "md",
      showLabel = false,
      label,
      striped = false,
      animated = false,
      ...props
    },
    ref
  ) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

    const sizeClasses = {
      xs: "h-1",
      sm: "h-1.5",
      md: "h-2",
      lg: "h-3",
      xl: "h-4",
    };

    const variantClasses = {
      default: "bg-[var(--color-primary)]",
      success: "bg-[var(--color-success)]",
      warning: "bg-[var(--color-warning)]",
      error: "bg-[var(--color-error)]",
      secondary: "bg-[var(--color-secondary)]",
    };

    return (
      <div ref={ref} className={`w-full ${className}`} {...props} role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={max} aria-label={label}>
        <div className={`progress ${sizeClasses[size]} overflow-hidden`}>
          <div
            className={`progress-bar ${variantClasses[variant]} ${striped ? "bg-stripes" : ""} ${animated ? "animate-pulse" : ""}`}
            style={{ width: `${percentage}%` }}
            role="presentation"
          />
        </div>
        {(showLabel || label) && (
          <div className="flex items-center justify-between mt-1.5">
            <span className="text-xs font-medium text-[var(--color-text-secondary)]">{label || `${Math.round(percentage)}%`}</span>
            {showLabel && <span className="text-xs font-mono tabular-nums text-[var(--color-text-tertiary)]">{value} / {max}</span>}
          </div>
        )}
      </div>
    );
  }
);

Progress.displayName = "Progress";

export const CircularProgress = forwardRef(
  (
    {
      value = 0,
      max = 100,
      size = 48,
      strokeWidth = 4,
      className = "",
      variant = "default",
      showLabel = true,
      label,
      ...props
    },
    ref
  ) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;

    const variantClasses = {
      default: "text-[var(--color-primary)]",
      success: "text-[var(--color-success)]",
      warning: "text-[var(--color-warning)]",
      error: "text-[var(--color-error)]",
      secondary: "text-[var(--color-secondary)]",
    };

    return (
      <div ref={ref} className={`relative inline-flex ${className}`} {...props} role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={max} aria-label={label} style={{ width: size, height: size }}>
        <svg className="transform -rotate-90" width={size} height={size}>
          <circle
            className="text-[var(--color-border)]"
            strokeWidth={strokeWidth}
            stroke="currentColor"
            fill="transparent"
            r={radius}
            cx={size / 2}
            cy={size / 2}
          />
          <circle
            className={`${variantClasses[variant]} transition-all duration-500 ease-out`}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            stroke="currentColor"
            fill="transparent"
            r={radius}
            cx={size / 2}
            cy={size / 2}
            style={{ transition: "stroke-dashoffset 0.5s ease-out" }}
          />
        </svg>
        {(showLabel || label) && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-sm font-bold text-[var(--color-text-primary)]">{label || `${Math.round(percentage)}%`}</span>
          </div>
        )}
      </div>
    );
  }
);

CircularProgress.displayName = "CircularProgress";

export default Progress;