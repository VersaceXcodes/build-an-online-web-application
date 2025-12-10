import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
	"inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kake-caramel-400 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-95 hover:scale-105",
	{
		variants: {
			variant: {
				default:
					"gradient-caramel text-white shadow-caramel hover:shadow-caramel-lg hover:animate-drip hover:bg-gradient-to-br hover:from-[#ba8550] hover:to-[#a0744d]",
				destructive:
					"bg-kake-berry-500 text-white shadow-soft hover:bg-kake-berry-600 hover:shadow-soft-lg",
				outline:
					"border-2 border-kake-caramel-400 bg-white text-kake-caramel-600 hover:bg-kake-caramel-50 hover:border-kake-caramel-500",
				secondary:
					"bg-kake-cream-400 text-kake-chocolate-700 hover:bg-kake-cream-500 shadow-soft hover:shadow-soft-lg",
				ghost:
					"text-kake-chocolate-600 hover:bg-kake-cream-200 hover:text-kake-chocolate-700",
				link:
					"text-kake-caramel-600 underline-offset-4 hover:underline hover:text-kake-caramel-700",
			},
			size: {
				default: "h-10 px-4 py-2",
				sm: "h-9 rounded-md px-3 text-xs",
				lg: "h-12 rounded-lg px-8 text-base",
				icon: "h-10 w-10",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "default",
		},
	},
);

export interface ButtonProps
	extends React.ButtonHTMLAttributes<HTMLButtonElement>,
		VariantProps<typeof buttonVariants> {
	asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
	({ className, variant, size, asChild = false, ...props }, ref) => {
		const Comp = asChild ? Slot : "button";
		return (
			<Comp
				className={cn(buttonVariants({ variant, size, className }))}
				ref={ref}
				{...props}
			/>
		);
	},
);
Button.displayName = "Button";

export { Button, buttonVariants };
