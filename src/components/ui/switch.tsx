import * as React from "react";

// Simple switch component without using Radix UI
const Switch = React.forwardRef<
  HTMLDivElement,
  {
    checked?: boolean;
    onCheckedChange?: (checked: boolean) => void;
    disabled?: boolean;
    id?: string;
    name?: string;
    className?: string;
  }
>(({ checked = false, onCheckedChange, disabled = false, id, name, className, ...props }, ref) => {
  const handleClick = () => {
    if (!disabled && onCheckedChange) {
      onCheckedChange(!checked);
    }
  };

  return (
    <div
      ref={ref}
      role="switch"
      tabIndex={disabled ? -1 : 0}
      aria-checked={checked}
      aria-disabled={disabled}
      data-state={checked ? "checked" : "unchecked"}
      data-disabled={disabled ? true : undefined}
      id={id}
      onClick={handleClick}
      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
        checked ? "bg-blue-500" : "bg-gray-200"
      } ${disabled ? "pointer-events-none opacity-50" : ""} ${className || ""}`}
      {...props}
    >
      <span
        aria-hidden="true"
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
          checked ? "translate-x-5" : "translate-x-0"
        }`}
      />
      {name && (
        <input
          type="checkbox"
          name={name}
          checked={checked}
          onChange={(e) => onCheckedChange?.(e.target.checked)}
          className="sr-only"
          disabled={disabled}
        />
      )}
    </div>
  );
});

Switch.displayName = "Switch";

export { Switch }; 