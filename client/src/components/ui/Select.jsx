import { forwardRef } from "react";

const Select = forwardRef(
  (
    {
      label,
      error,
      hint,
      options = [],
      placeholder = "Select an option",
      className = "",
      id,
      leftIcon,
      ...props
    },
    ref
  ) => {
    const selectId = id || label?.toLowerCase().replace(/\s+/g, "-");
    const errorId = error ? `${selectId}-error` : undefined;
    const hintId = hint ? `${selectId}-hint` : undefined;

    const describedBy = [errorId, hintId].filter(Boolean).join(" ") || undefined;

    return (
      <div className={`form-group ${className}`}>
        {label && (
          <label htmlFor={selectId} className="form-label">
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="input-icon" aria-hidden="true">
              {leftIcon}
            </div>
          )}
          <select
            ref={ref}
            id={selectId}
            className={`form-select ${error ? "form-input-error" : ""} ${leftIcon ? "pl-10" : ""}`}
            aria-invalid={error ? "true" : "false"}
            aria-describedby={describedBy}
            {...props}
          >
            <option value="" disabled>
              {placeholder}
            </option>
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
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

Select.displayName = "Select";

export default Select;