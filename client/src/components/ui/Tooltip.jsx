import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";

const Tooltip = ({
  children,
  content,
  position = "top",
  delay = 200,
  className = "",
  arrow = true,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const tooltipRef = useRef(null);
  const triggerRef = useRef(null);
  const timeoutRef = useRef(null);

  const showTooltip = () => {
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
      updatePosition();
    }, delay);
  };

  const hideTooltip = () => {
    clearTimeout(timeoutRef.current);
    setIsVisible(false);
  };

  const updatePosition = () => {
    if (!triggerRef.current || !tooltipRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const gap = 8;

    let top, left;

    switch (position) {
      case "top":
        top = triggerRect.top - tooltipRect.height - gap;
        left = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2;
        break;
      case "bottom":
        top = triggerRect.bottom + gap;
        left = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2;
        break;
      case "left":
        top = triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2;
        left = triggerRect.left - tooltipRect.width - gap;
        break;
      case "right":
        top = triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2;
        left = triggerRect.right + gap;
        break;
      default:
        top = triggerRect.top - tooltipRect.height - gap;
        left = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2;
    }

    setTooltipPosition({ top, left });
  };

  useEffect(() => {
    if (isVisible) {
      updatePosition();
      window.addEventListener("scroll", updatePosition, true);
      window.addEventListener("resize", updatePosition);
      return () => {
        window.removeEventListener("scroll", updatePosition, true);
        window.removeEventListener("resize", updatePosition);
      };
    }
  }, [isVisible, position]);

  const arrowPositions = {
    top: "bottom-[-4px] left-1/2 -translate-x-1/2 rotate-45",
    bottom: "top-[-4px] left-1/2 -translate-x-1/2 rotate-45",
    left: "right-[-4px] top-1/2 -translate-y-1/2 rotate-45",
    right: "left-[-4px] top-1/2 -translate-y-1/2 rotate-45",
  };

  const child = typeof children === "function" ? children({ showTooltip, hideTooltip }) : children;

  const tooltipContent = isVisible ? createPortal(
    <div
      ref={tooltipRef}
      className={`tooltip ${className}`}
      style={{ top: tooltipPosition.top, left: tooltipPosition.left }}
      role="tooltip"
      aria-hidden="false"
    >
      {content}
      {arrow && <div className={`tooltip-arrow ${arrowPositions[position]}`} aria-hidden="true" />}
    </div>,
    document.body
  ) : null;

  return (
    <div
      ref={triggerRef}
      className="inline-block"
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}
    >
      {child}
      {tooltipContent}
    </div>
  );
};

export default Tooltip;