import React, { useEffect } from "react";
import statusIcon from "./assets/status.svg";

type Props = {
  open: boolean;
  title?: React.ReactNode;
  onClose?: () => void;
  onAction?: () => void;
  onBack?: () => void;
  children?: React.ReactNode;
  className?: string;
};

export default function Modal({
  open,
  title,
  onClose,
  onAction,
  onBack,
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
        <header className={`gb-modal-header ${onBack ? "has-back" : ""}`}>
          <div className="gb-modal-left">
            {onBack ? (
              <button
                className="details-back-btn"
                onClick={onBack}
                aria-label="Back"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M15 18L9 12L15 6"
                    stroke="#16c784"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            ) : null}

            <div className="gb-modal-title">{title}</div>
          </div>

          <div className="gb-modal-right">
            {typeof onAction === "function" ? (
              <button
                className="gb-modal-action-pill"
                aria-label="Open My Progress"
                onClick={onAction}
              >
                <span className="pill-icon">
                  <img src={statusIcon} alt="status" />
                </span>
                <span className="pill-text">My Progress</span>
                <span className="pill-chevron" aria-hidden>
                  <svg
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M9 6L15 12L9 18"
                      stroke="#059669"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </button>
            ) : null}
          </div>
        </header>
        <div className="gb-modal-body">{children}</div>
      </div>
    </div>
  );
}
