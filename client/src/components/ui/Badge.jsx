import { forwardRef } from "react";

const Badge = forwardRef(
  (
    {
      children,
      variant = "neutral",
      size = "md",
      className = "",
      dot = false,
      dotColor,
      ...props
    },
    ref
  ) => {
    const variantClasses = {
      primary: "bg-[var(--color-primary-light)] text-[var(--color-primary)]",
      secondary: "bg-[var(--color-secondary-light)] text-[var(--color-secondary)]",
      success: "bg-[var(--color-success-light)] text-[var(--color-success)]",
      warning: "bg-[var(--color-warning-light)] text-[var(--color-warning)]",
      error: "bg-[var(--color-error-light)] text-[var(--color-error)]",
      neutral: "bg-[var(--color-surface-hover)] text-[var(--color-text-secondary)] border border-[var(--color-border)]",
    };

    const sizeClasses = {
      sm: "px-2 py-0.5 text-[11px] gap-1",
      md: "px-2.5 py-0.5 text-xs gap-1.5",
      lg: "px-3 py-1 text-sm gap-2",
    };

    const dotColors = {
      success: "bg-[var(--color-success)]",
      warning: "bg-[var(--color-warning)]",
      error: "bg-[var(--color-error)]",
      neutral: "bg-[var(--color-text-tertiary)]",
      primary: "bg-[var(--color-primary)]",
    };

    return (
      <span
        ref={ref}
        className={`inline-flex items-center rounded-full font-medium ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
        {...props}
      >
        {(dot || dotColor) && (
          <span
            className={`size-1.5 rounded-full ${dotColors[dotColor || variant] || dotColors.neutral}`}
            aria-hidden="true"
          />
        )}
        {children}
      </span>
    );
  }
);

Badge.displayName = "Badge";

export default Badge;