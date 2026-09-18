import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import Button from "./Button";

const ConfirmationDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Action",
  message = "Are you sure you want to proceed?",
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "danger",
  loading = false,
  icon,
}) => {
  const dialogRef = useRef(null);
  const previousActiveElement = useRef(null);

  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement;
      document.body.style.overflow = "hidden";
      setTimeout(() => dialogRef.current?.focus(), 0);

      const handleKeyDown = (e) => {
        if (e.key === "Escape") {
          onClose();
        }
        if (e.key === "Tab") {
          trapFocus(e);
        }
      };

      document.addEventListener("keydown", handleKeyDown);
      return () => {
        document.removeEventListener("keydown", handleKeyDown);
        document.body.style.overflow = "";
        previousActiveElement.current?.focus();
      };
    }
  }, [isOpen, onClose]);

  const trapFocus = (e) => {
    if (!dialogRef.current) return;

    const focusableElements = dialogRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (e.shiftKey && document.activeElement === firstElement) {
      e.preventDefault();
      lastElement.focus();
    } else if (!e.shiftKey && document.activeElement === lastElement) {
      e.preventDefault();
      firstElement.focus();
    }
  };

  if (!isOpen) return null;

  const variantStyles = {
    danger: "bg-[var(--color-error)] text-[var(--color-error-foreground)] hover:bg-[var(--color-error-hover)]",
    warning: "bg-[var(--color-warning)] text-[var(--color-warning-foreground)] hover:bg-[var(--color-warning-hover)]",
    primary: "bg-[var(--color-primary)] text-[var(--color-primary-foreground)] hover:bg-[var(--color-primary-hover)]",
    success: "bg-[var(--color-success)] text-[var(--color-success-foreground)] hover:bg-[var(--color-success-hover)]",
  };

  const dialogContent = (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()} role="presentation">
      <div
        ref={dialogRef}
        className="modal-content max-w-md"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        aria-describedby="confirm-message"
        tabIndex="-1"
      >
        <div className="modal-header">
          <div className="flex items-center gap-3">
            {icon && <div className="size-10 rounded-xl bg-[var(--color-primary-light)] flex items-center justify-center text-[var(--color-primary)]" aria-hidden="true">{icon}</div>}
            <h2 id="confirm-title" className="modal-title">{title}</h2>
          </div>
        </div>
        <div className="modal-body">
          <p id="confirm-message" className="text-[var(--color-text-secondary)]">{message}</p>
        </div>
        <div className="modal-footer">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button variant={variant} onClick={onConfirm} loading={loading} disabled={loading}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );

  return createPortal(dialogContent, document.body);
};

export default ConfirmationDialog;