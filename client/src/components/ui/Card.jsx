import { forwardRef } from "react";

const Card = forwardRef(
  (
    {
      children,
      className = "",
      variant = "default",
      padding = "md",
      hover = false,
      interactive = false,
      onClick,
      ...props
    },
    ref
  ) => {
    const variantClasses = {
      default: "bg-[var(--color-surface)] shadow-sm border border-[var(--color-border)]",
      elevated: "bg-[var(--color-surface-elevated)] shadow-lg border border-[var(--color-border)]",
      outlined: "bg-transparent border-2 border-[var(--color-border)]",
      filled: "bg-[var(--color-surface-hover)] border border-[var(--color-border)]",
    };

    const paddingClasses = {
      none: "",
      sm: "p-3 sm:p-4",
      md: "p-4 sm:p-6",
      lg: "p-6 sm:p-8",
    };

    const baseClasses = "rounded-2xl transition-all duration-200";

    const hoverClasses = hover || interactive
      ? "hover:shadow-md hover:border-[var(--color-border-strong)]"
      : "";

    const interactiveClasses = interactive
      ? "cursor-pointer active:shadow-sm active:scale-[0.99]"
      : "";

    return (
      <div
        ref={ref}
        className={`${baseClasses} ${variantClasses[variant]} ${paddingClasses[padding]} ${hoverClasses} ${interactiveClasses} ${className}`}
        onClick={onClick}
        role={interactive ? "button" : undefined}
        tabIndex={interactive ? 0 : undefined}
        onKeyDown={interactive && onClick ? (e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onClick(e);
          }
        } : undefined}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";

export default Card;