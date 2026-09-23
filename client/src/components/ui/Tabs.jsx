import { useState } from "react";
import { forwardRef } from "react";

const Tabs = forwardRef(
  (
    {
      tabs = [],
      defaultIndex = 0,
      onChange,
      className = "",
      variant = "default",
      fullWidth = true,
    },
    ref,
  ) => {
    const [activeIndex, setActiveIndex] = useState(defaultIndex);
    const handleTabClick = (index) => {
      setActiveIndex(index);
      onChange?.(index, tabs[index]);
    };

    const variantClasses = {
      default: "bg-[var(--color-surface-hover)]",
      underline: "bg-transparent border-b border-[var(--color-border)] p-0",
      pills: "bg-[var(--color-surface-hover)]",
    };

    const tabVariants = {
      default: {
        base: "rounded-lg transition-all",
        active:
          "bg-[var(--color-surface)] text-[var(--color-primary)] shadow-sm",
        inactive:
          "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]",
      },
      underline: {
        base: "rounded-none border-b-2 transition-all",
        active: "border-[var(--color-primary)] text-[var(--color-primary)]",
        inactive:
          "border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:border-[var(--color-border)]",
      },
      pills: {
        base: "rounded-xl transition-all",
        active: "bg-[var(--color-primary-light)] text-[var(--color-primary)]",
        inactive:
          "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface)]",
      },
    };

    const tabStyle = tabVariants[variant] || tabVariants.default;

    return (
      <div
        ref={ref}
        className={className}
        role="tablist"
        aria-orientation="horizontal"
      >
        <div
          className={`${variantClasses[variant]} ${variant === "underline" ? "" : "rounded-xl p-1"} ${fullWidth ? "w-full" : "inline-flex"}`}
        >
          {tabs.map((tab, index) => (
            <button
              key={tab.id || index}
              role="tab"
              aria-selected={index === activeIndex}
              aria-controls={`tabpanel-${tab.id || index}`}
              id={`tab-${tab.id || index}`}
              tabIndex={index === activeIndex ? 0 : -1}
              onClick={() => handleTabClick(index)}
              disabled={tab.disabled}
              className={`
                flex-1 px-4 py-2.5 text-sm font-medium
                ${tabStyle.base}
                ${index === activeIndex ? tabStyle.active : tabStyle.inactive}
                ${tab.disabled ? "opacity-50 cursor-not-allowed" : ""}
              `}
            >
              {tab.icon && (
                <span
                  className="inline-flex items-center gap-1.5"
                  aria-hidden="true"
                >
                  {tab.icon}
                  {tab.label && <span>{tab.label}</span>}
                </span>
              )}
              {!tab.icon && tab.label}
              {tab.badge && (
                <span className="ml-1.5 px-1.5 py-0.5 text-[10px] font-medium rounded-full bg-[var(--color-primary-light)] text-[var(--color-primary)]">
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>
        <div className="mt-4">
          {tabs.map((tab, index) => (
            <div
              key={tab.id || index}
              role="tabpanel"
              id={`tabpanel-${tab.id || index}`}
              aria-labelledby={`tab-${tab.id || index}`}
              hidden={index !== activeIndex}
              className={index === activeIndex ? "" : "hidden"}
            >
              {tab.content}
            </div>
          ))}
        </div>
      </div>
    );
  },
);

Tabs.displayName = "Tabs";

export default Tabs;
