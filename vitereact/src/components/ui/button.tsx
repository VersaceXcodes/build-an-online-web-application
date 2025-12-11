import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
	"inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-luxury-gold-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-95 min-h-[44px] md:min-h-[40px]",
	{
		variants: {
			variant: {
				default:
					"gradient-gold text-luxury-darkCharcoal font-semibold shadow-glow-gold hover:shadow-glow-gold-lg hover:scale-105 border border-luxury-gold-500/30",
				destructive:
					"bg-red-600 text-white shadow-glow-gold-sm hover:bg-red-700 hover:shadow-glow-gold border border-red-700/30",
				outline:
					"border-2 border-luxury-gold-500 glass-luxury text-luxury-champagne hover:bg-luxury-gold-500/10 hover:shadow-glow-gold",
				secondary:
					"glass-luxury text-luxury-champagne hover:glass-luxury-darker shadow-luxury hover:shadow-luxury-lg border border-luxury-gold-500/20",
				ghost:
					"text-luxury-champagne hover:glass-luxury hover:text-luxury-gold-500",
				link:
					"text-luxury-gold-500 underline-offset-4 hover:underline hover:text-luxury-gold-400",
			},
			size: {
				default: "h-10 px-4 py-2 min-h-[44px] md:min-h-[40px]",
				sm: "h-9 rounded-md px-3 text-xs min-h-[40px] md:min-h-[36px]",
				lg: "h-12 rounded-lg px-8 text-base min-h-[48px]",
				icon: "h-10 w-10 min-h-[44px] min-w-[44px] md:min-h-[40px] md:min-w-[40px]",
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
