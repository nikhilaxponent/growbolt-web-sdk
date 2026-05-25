import React, { useEffect } from "react";

type Props = {
  open: boolean;
  title?: React.ReactNode;
  onClose?: () => void;
  children?: React.ReactNode;
  className?: string;
};

export default function Modal({
  open,
  title,
  onClose,
  children,
  className = "",
}: Props) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose?.();
    }
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className={`gb-modal-backdrop`}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <div className={`gb-modal ${className}`}>
        <header className="gb-modal-header">
          <div className="gb-modal-title">{title}</div>
          <button
            className="gb-modal-close"
            aria-label="Close"
            onClick={onClose}
          >
            ✕
          </button>
        </header>
        <div className="gb-modal-body">{children}</div>
      </div>
    </div>
  );
}
