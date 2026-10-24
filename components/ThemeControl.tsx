import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { Sun, Moon, Monitor, ChevronDown, Check } from "lucide-react";

const options = [
  { value: "system", label: "System", Icon: Monitor },
  { value: "light", label: "Light", Icon: Sun },
  { value: "dark", label: "Dark", Icon: Moon },
];
export default function ThemeControl({
  theme,
  onChange,
}: {
  theme: string;
  onChange: (theme: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const id = useId();
  const selected =
    options.find((option) => option.value === theme) || options[0];
  useEffect(() => {
    if (!open) return;
    const outside = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", outside);
    return () => document.removeEventListener("pointerdown", outside);
  }, [open]);
  useEffect(() => {
    if (open)
      panel.current
        ?.querySelector<HTMLElement>('[aria-checked="true"]')
        ?.focus({ preventScroll: true });
  }, [open]);
  const close = () => {
    setOpen(false);
    trigger.current?.focus({ preventScroll: true });
  };
  function keys(event: KeyboardEvent) {
    if (event.key === "Escape" && open) {
      event.preventDefault();
      event.stopPropagation();
      close();
      return;
    }
    if (!open) return;
    const buttons = Array.from(
      panel.current?.querySelectorAll<HTMLButtonElement>("button") || []
    );
    const index = buttons.indexOf(document.activeElement as HTMLButtonElement);
    let next = -1;
    if (event.key === "ArrowDown") next = (index + 1) % buttons.length;
    if (event.key === "ArrowUp")
      next = (index - 1 + buttons.length) % buttons.length;
    if (event.key === "Home") next = 0;
    if (event.key === "End") next = buttons.length - 1;
    if (next >= 0) {
      event.preventDefault();
      buttons[next]?.focus();
    }
  }
  return (
    <div
      ref={root}
      className={"theme-control theme-picker " + (open ? "is-open" : "")}
      onKeyDown={keys}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node))
          setOpen(false);
      }}
    >
      <button
        ref={trigger}
        className="theme-trigger"
        type="button"
        aria-label={"Color theme: " + selected.label}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((value) => !value)}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault();
            setOpen(true);
          }
        }}
      >
        <selected.Icon size={16} aria-hidden="true" />
        <span>{selected.label}</span>
        <ChevronDown className="theme-chevron" size={14} aria-hidden="true" />
      </button>
      <div
        ref={panel}
        id={id}
        className="theme-dropdown"
        role="menu"
        aria-label="Color theme"
        aria-hidden={!open}
        inert={!open}
      >
        <p className="theme-dropdown-label" role="presentation">
          Appearance
        </p>
        {options.map(({ value, label, Icon }) => (
          <button
            key={value}
            type="button"
            role="menuitemradio"
            aria-checked={theme === value}
            tabIndex={open ? 0 : -1}
            onClick={() => {
              onChange(value);
              close();
            }}
          >
            <Icon size={17} aria-hidden="true" />
            <span>{label}</span>
            {theme === value && (
              <Check size={16} className="theme-check" aria-hidden="true" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
