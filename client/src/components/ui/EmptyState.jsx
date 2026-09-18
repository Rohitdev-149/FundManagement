import { forwardRef } from "react";
import Button from "./Button";

const EmptyState = forwardRef(
  (
    {
      title = "No data yet",
      description = "Get started by adding your first item.",
      icon,
      action,
      actionLabel,
      className = "",
      illustration,
      size = "md",
    },
    ref
  ) => {
    const sizeClasses = {
      sm: "p-6",
      md: "p-8 sm:p-12",
      lg: "p-12 sm:p-16",
    };

    const iconSizeClasses = {
      sm: "size-12",
      md: "size-16",
      lg: "size-20",
    };

    const titleSizeClasses = {
      sm: "text-base",
      md: "text-lg",
      lg: "text-xl",
    };

    const descSizeClasses = {
      sm: "text-sm",
      md: "text-sm",
      lg: "text-base",
    };

    const DefaultIcon = () => (
      <svg className="size-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    );

    return (
      <div
        ref={ref}
        className={`empty-state ${sizeClasses[size]} ${className}`}
        role="status"
      >
        {illustration ? (
          <div className="mb-4" aria-hidden="true">
            {illustration}
          </div>
        ) : (
          <div className={`empty-state-icon ${iconSizeClasses[size]} mb-4`} aria-hidden="true">
            {icon || <DefaultIcon />}
          </div>
        )}
        <h3 className={`empty-state-title ${titleSizeClasses[size]}`}>{title}</h3>
        <p className={`empty-state-description ${descSizeClasses[size]}`}>{description}</p>
        {action && actionLabel && (
          <div className="mt-4">
            <Button onClick={action} variant="primary" size="md">
              {actionLabel}
            </Button>
          </div>
        )}
      </div>
    );
  }
);

EmptyState.displayName = "EmptyState";

export default EmptyState;