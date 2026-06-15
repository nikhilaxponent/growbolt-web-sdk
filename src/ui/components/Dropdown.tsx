import React, { useEffect, useRef, useState, useLayoutEffect } from "react";
import { createPortal } from "react-dom";

type Option<T = string> = { label: string; value: T; disabled?: boolean };

type Props<T = string> = {
  options: Option<T>[];
  value?: T | null;
  onChange?: (v: T) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  controlClassName?: string;
  menuClassName?: string;
  optionClassName?: string;
  width?: string | number;
  closeOnSelect?: boolean;
  renderOption?: (opt: Option<T>, selected: boolean) => React.ReactNode;
  renderValue?: (opt?: Option<T>) => React.ReactNode;
  forceBelow?: boolean;
};

export default function Dropdown<T = string>({
  options,
  value = null,
  onChange,
  placeholder = "Select...",
  disabled = false,
  className = "",
  controlClassName = "",
  menuClassName = "",
  optionClassName = "",
  width = "100%",
  closeOnSelect = true,
  renderOption,
  renderValue,
  forceBelow = false,
}: Props<T>) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [rect, setRect] = useState<DOMRect | null>(null);

  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      // don't close when clicking inside the control or the portal menu
      const target = e.target as Node;
      if (ref.current && ref.current.contains(target)) return;
      if (menuRef.current && menuRef.current.contains(target)) return;
      setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  useLayoutEffect(() => {
    if (!open || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const prev = rect;
    const changed =
      !prev ||
      prev.left !== r.left ||
      prev.top !== r.top ||
      prev.right !== r.right ||
      prev.bottom !== r.bottom ||
      prev.width !== r.width ||
      prev.height !== r.height;
    if (changed) setRect(r);
  }, [open, rect]);

  const handleSelect = (opt: Option<T>) => {
    if (opt.disabled) return;
    onChange?.(opt.value);
    if (closeOnSelect) setOpen(false);
  };

  return (
    <div
      ref={ref}
      className={`relative inline-block ${className}`}
      style={{ width }}
    >
      <button
        type="button"
        className={`w-full h-12 px-4 flex items-center justify-between text-sm ${controlClassName}`}
        onClick={() => !disabled && setOpen((s) => !s)}
        aria-haspopup="listbox"
        aria-expanded={open}
        disabled={disabled}
      >
        <div className="truncate text-left" style={{ flex: 1 }}>
          {renderValue
            ? renderValue(selected)
            : (selected?.label ?? (
                <span className="opacity-60">{placeholder}</span>
              ))}
        </div>

        <div className="ml-3 flex-shrink-0" aria-hidden>
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={`${open ? "transform rotate-180" : ""} transition-transform`}
          >
            <path
              d="M6 9l6 6 6-6"
              stroke="currentColor"
              strokeWidth={1.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </button>

      {open &&
        rect &&
        createPortal(
          <div
            ref={menuRef}
            role="listbox"
            tabIndex={-1}
            className={`gb-dropdown-menu z-50 ${menuClassName}`}
            style={{
              position: "fixed",
              left: rect.left,
              top: rect.bottom + 8,
              width: rect.width,
              maxHeight: 320,
              overflow: "auto",
              zIndex: 1000000,
            }}
          >
            {options.map((opt, i) => {
              const sel = selected?.value === opt.value;
              return (
                <div
                  key={String(opt.value) + "-" + i}
                  role="option"
                  aria-selected={sel}
                  onClick={() => handleSelect(opt)}
                  ref={(el) => {
                    /* attach nothing here; menuRef is root */
                  }}
                  className={`gb-dropdown-option ${opt.disabled ? "disabled" : ""} ${sel ? "selected" : ""} ${optionClassName}`}
                >
                  {renderOption ? (
                    renderOption(opt, sel)
                  ) : (
                    <div className={`flex-1 ${sel ? "font-semibold" : ""}`}>
                      {opt.label}
                    </div>
                  )}
                  {sel && (
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M20 6L9 17l-5-5"
                        stroke="currentColor"
                        strokeWidth={1.6}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </div>
              );
            })}
          </div>,
          document.body,
        )}
    </div>
  );
}
