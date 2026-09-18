import { forwardRef } from "react";

const Button = forwardRef(
  (
    {
      children,
      variant = "primary",
      size = "md",
      className = "",
      disabled = false,
      loading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      type = "button",
      ...props
    },
    ref
  ) => {
    const baseClasses =
      "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-ring-offset)] disabled:opacity-50 disabled:cursor-not-allowed";

    const variantClasses = {
      primary: "bg-[var(--color-primary)] text-[var(--color-primary-foreground)] hover:bg-[var(--color-primary-hover)] active:bg-[var(--color-primary-hover)] shadow-sm",
      secondary: "bg-[var(--color-surface)] text-[var(--color-text-primary)] border border-[var(--color-border)] hover:bg-[var(--color-surface-hover)] active:bg-[var(--color-surface-hover)]",
      ghost: "bg-transparent text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text-primary)] active:bg-[var(--color-surface-hover)]",
      danger: "bg-[var(--color-error)] text-[var(--color-error-foreground)] hover:bg-[var(--color-error-hover)] active:bg-[var(--color-error-hover)] shadow-sm",
      success: "bg-[var(--color-success)] text-[var(--color-success-foreground)] hover:bg-[var(--color-success-hover)] active:bg-[var(--color-success-hover)] shadow-sm",
      warning: "bg-[var(--color-warning)] text-[var(--color-warning-foreground)] hover:bg-[var(--color-warning-hover)] active:bg-[var(--color-warning-hover)] shadow-sm",
      outline: "border border-[var(--color-border)] bg-transparent text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)]",
    };

    const sizeClasses = {
      sm: "min-h-[36px] px-3 py-1.5 text-sm gap-1.5",
      md: "min-h-[44px] px-4 py-2 text-sm gap-2",
      lg: "min-h-[52px] px-6 py-3 text-base gap-2",
    };

    const widthClass = fullWidth ? "w-full" : "";

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || loading}
        className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${widthClass} ${className}`}
        {...props}
      >
        {loading ? (
          <svg
            className="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        ) : leftIcon ? (
          <span aria-hidden="true">{leftIcon}</span>
        ) : null}
        {children}
        {!loading && rightIcon && <span aria-hidden="true">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;