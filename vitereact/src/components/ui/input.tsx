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
					"flex h-10 w-full rounded-lg border-2 border-warm-200 bg-white px-3 py-2 text-sm text-warm-900 transition-all duration-200 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-warm-400 focus-visible:outline-none focus-visible:border-kake-caramel-400 focus-visible:ring-2 focus-visible:ring-kake-caramel-200 focus-visible:shadow-caramel disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-warm-50 hover:border-warm-300",
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
