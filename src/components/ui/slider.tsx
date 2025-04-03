import * as React from "react";

const Slider = React.forwardRef<
  HTMLDivElement,
  {
    value?: number[];
    min?: number;
    max?: number;
    step?: number;
    disabled?: boolean;
    onValueChange?: (value: number[]) => void;
    id?: string;
    className?: string;
  }
>(
  (
    {
      value = [0],
      min = 0,
      max = 100,
      step = 1,
      disabled = false,
      onValueChange,
      id,
      className,
      ...props
    },
    ref
  ) => {
    const [isDragging, setIsDragging] = React.useState(false);
    const trackRef = React.useRef<HTMLDivElement>(null);

    const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (onValueChange) {
        onValueChange([Number(e.target.value)]);
      }
    };

    // Calculate percentage
    const percentage = ((value[0] - min) / (max - min)) * 100;

    return (
      <div
        ref={ref}
        className={`relative flex w-full touch-none select-none items-center ${
          disabled ? "opacity-50" : ""
        } ${className || ""}`}
        {...props}
      >
        <div
          ref={trackRef}
          className="relative h-2 w-full rounded-full bg-gray-200"
        >
          <div
            className="absolute h-full rounded-full bg-blue-500"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <input
          type="range"
          id={id}
          value={value[0]}
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          onChange={handleSliderChange}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        />
        <div
          className="absolute h-4 w-4 rounded-full border-2 border-blue-500 bg-white shadow"
          style={{
            left: `calc(${percentage}% - 0.5rem)`,
            top: "50%",
            transform: "translateY(-50%)",
          }}
        />
      </div>
    );
  }
);

Slider.displayName = "Slider";

export { Slider }; 