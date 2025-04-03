import * as React from "react";

// Button variant types
type ButtonVariant = "default" | "primary" | "destructive" | "outline" | "ghost" | "link";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: "default" | "sm" | "lg" | "icon";
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant = "default", size = "default", type = "button", ...props },
    ref
  ) => {
    // Base styles
    const baseStyles = "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";
    
    // Variant styles
    const variantStyles = {
      default: "bg-gray-100 text-gray-900 hover:bg-gray-200",
      primary: "bg-blue-600 text-white hover:bg-blue-700",
      destructive: "bg-red-500 text-white hover:bg-red-600",
      outline: "border border-gray-300 bg-transparent hover:bg-gray-100",
      ghost: "bg-transparent hover:bg-gray-100",
      link: "bg-transparent text-blue-600 hover:underline",
    };
    
    // Size styles
    const sizeStyles = {
      default: "h-10 py-2 px-4",
      sm: "h-8 px-3 text-sm",
      lg: "h-12 px-6 text-lg",
      icon: "h-10 w-10 p-2",
    };
    
    // Combine styles
    const buttonStyles = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className || ""}`;
    
    return (
      <button type={type} className={buttonStyles} ref={ref} {...props} />
    );
  }
);

Button.displayName = "Button";

export { Button, type ButtonProps }; 