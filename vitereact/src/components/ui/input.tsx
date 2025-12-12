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
					"flex h-10 min-h-[44px] md:min-h-[40px] w-full rounded-lg border-2 border-warm-200 bg-white px-3 py-2 text-sm text-kake-chocolate-500 font-sans transition-all duration-300 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-kake-chocolate-500/50 focus-visible:outline-none focus-visible:border-kake-caramel-400 focus-visible:ring-2 focus-visible:ring-kake-caramel-500/20 focus-visible:shadow-caramel disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-warm-100 hover:border-warm-300",
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
