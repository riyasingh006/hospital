import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg font-medium transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary:
          "bg-primary-700 text-white shadow-sm hover:bg-primary-800 active:bg-primary-900",
        secondary:
          "border border-slate-300 bg-white text-primary-800 shadow-sm hover:bg-primary-50 hover:border-primary-300",
        emergency:
          "bg-[#B42318] text-white shadow-sm hover:bg-[#912018] active:bg-[#7A1B13]",
        success: "bg-india-600 text-white shadow-sm hover:bg-india-700",
        outlineSaffron:
          "border border-saffron-500 bg-white text-saffron-700 hover:bg-saffron-50",
        ghost: "text-primary-800 hover:bg-primary-50",
        subtle: "bg-primary-50 text-primary-800 hover:bg-primary-100",
        link: "text-care-600 underline-offset-4 hover:underline",
      },
      size: {
        sm: "h-8 px-3 text-xs",
        md: "h-10 px-4 text-sm",
        lg: "h-11 px-5 text-sm",
        xl: "h-13 px-7 text-base py-3.5",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, disabled, children, asChild, ...props }, ref) => {
    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children as React.ReactElement<any>, {
        className: cn(buttonVariants({ variant, size }), className, (children.props as any).className),
        ...(props as any),
      });
    }
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        disabled={disabled || loading}
        {...props}
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
