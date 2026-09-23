import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";

const Dropdown = ({
  trigger,
  items = [],
  align = "right",
  className = "",
  closeOnSelect = true,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const triggerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen) {
      const handleKeyDown = (e) => {
        if (e.key === "Escape") {
          setIsOpen(false);
          triggerRef.current?.focus();
        }
      };
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [isOpen]);

  const handleItemClick = (item) => {
    item.onClick?.();
    if (closeOnSelect) setIsOpen(false);
  };

  const menuItems = items.map((item, index) => {
    if (item.type === "divider") {
      return <div key={index} className="dropdown-divider" role="separator" />;
    }
    return (
      <button
        key={index}
        type="button"
        className={`dropdown-item ${item.danger ? "dropdown-item-danger" : ""} ${item.disabled ? "opacity-50 cursor-not-allowed" : ""}`}
        onClick={() => !item.disabled && handleItemClick(item)}
        disabled={item.disabled}
        role="menuitem"
      >
        {item.icon && (
          <span className="size-4" aria-hidden="true">
            {item.icon}
          </span>
        )}
        <span>{item.label}</span>
        {item.shortcut && (
          <span className="ml-auto text-xs text-[var(--color-text-tertiary)]">
            {item.shortcut}
          </span>
        )}
      </button>
    );
  });

  const alignClasses = {
    left: "left-0",
    right: "right-0",
    center: "left-1/2 -translate-x-1/2",
  };

  return (
    <div
      className={`dropdown-trigger relative inline-block ${className}`}
      ref={dropdownRef}
    >
      <div ref={triggerRef}>
        {typeof trigger === "function"
          ? trigger({ isOpen, toggle: () => setIsOpen(!isOpen) })
          : trigger}
      </div>
      {isOpen &&
        createPortal(
          <div
            className={`dropdown-menu ${alignClasses[align]}`}
            role="menu"
            aria-orientation="vertical"
          >
            {menuItems}
          </div>,
          document.body,
        )}
    </div>
  );
};

export default Dropdown;
