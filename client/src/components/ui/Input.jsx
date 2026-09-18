import { forwardRef } from "react";

const Input = forwardRef(
  (
    {
      label,
      error,
      hint,
      className = "",
      id,
      type = "text",
      leftIcon,
      rightIcon,
      ...props
    },
    ref
  ) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");
    const errorId = error ? `${inputId}-error` : undefined;
    const hintId = hint ? `${inputId}-hint` : undefined;

    const describedBy = [errorId, hintId].filter(Boolean).join(" ") || undefined;

    return (
      <div className={`form-group ${className}`}>
        {label && (
          <label htmlFor={inputId} className="form-label">
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="input-icon" aria-hidden="true">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            type={type}
            className={`form-input ${error ? "form-input-error" : ""} ${leftIcon ? "pl-10" : ""} ${rightIcon ? "pr-10" : ""}`}
            aria-invalid={error ? "true" : "false"}
            aria-describedby={describedBy}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)] size-5 pointer-events-none" aria-hidden="true">
              {rightIcon}
            </div>
          )}
        </div>
        {error && (
          <p id={errorId} className="form-error" role="alert">
            {error}
          </p>
        )}
        {hint && !error && (
          <p id={hintId} className="form-hint">
            {hint}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;