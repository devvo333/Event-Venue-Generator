import * as React from "react";

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
  className?: string;
}

export function ColorPicker({ color, onChange, className }: ColorPickerProps) {
  // Simple color options
  const colorOptions = [
    "#000000", // black
    "#ffffff", // white
    "#ff0000", // red
    "#00ff00", // green
    "#0000ff", // blue
    "#ffff00", // yellow
    "#ff00ff", // magenta
    "#00ffff", // cyan
    "#ff8000", // orange
    "#8000ff", // purple
    "#0080ff", // light blue
    "#ff0080", // pink
    "transparent", // transparent
  ];

  return (
    <div className={`flex flex-col gap-2 ${className || ""}`}>
      <div className="flex gap-1">
        {colorOptions.map((c) => (
          <button
            key={c}
            type="button"
            className={`h-6 w-6 rounded-md border border-gray-300 ${
              c === color ? "ring-2 ring-blue-500" : ""
            } ${c === "transparent" ? "bg-gray-100" : ""}`}
            style={{
              backgroundColor: c !== "transparent" ? c : "transparent",
              backgroundImage:
                c === "transparent"
                  ? "linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%, #ccc), linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%, #ccc)"
                  : "none",
              backgroundSize: c === "transparent" ? "10px 10px" : "auto",
              backgroundPosition:
                c === "transparent" ? "0 0, 5px 5px" : "center",
            }}
            onClick={() => onChange(c)}
            aria-label={`Color: ${c}`}
          />
        ))}
      </div>
      <div className="flex gap-2">
        <div
          className="h-8 w-8 rounded-md border border-gray-300"
          style={{ backgroundColor: color !== "transparent" ? color : "white" }}
        />
        <input
          type="color"
          value={color !== "transparent" ? color : "#ffffff"}
          onChange={(e) => onChange(e.target.value)}
          className="h-8 cursor-pointer"
          disabled={color === "transparent"}
        />
      </div>
    </div>
  );
} 