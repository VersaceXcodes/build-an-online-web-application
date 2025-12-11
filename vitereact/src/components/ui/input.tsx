import * as React from "react";

import { cn } from "@/lib/utils";

export interface InputProps
	extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
	({ className, type, ...props }, ref) => {
		return (
			<input
				type={type}
				className={cn(
					"flex h-10 min-h-[44px] md:min-h-[40px] w-full rounded-lg border border-luxury-gold-500/30 glass-luxury px-3 py-2 text-sm text-luxury-champagne font-sans transition-all duration-300 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-luxury-champagne/50 focus-visible:outline-none focus-visible:border-luxury-gold-500 focus-visible:ring-2 focus-visible:ring-luxury-gold-500/20 focus-visible:shadow-glow-gold-sm disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-luxury-darkCocoa/50 hover:border-luxury-gold-500/50",
					className,
				)}
				ref={ref}
				{...props}
			/>
		);
	},
);
Input.displayName = "Input";

export { Input };
