import * as React from "react";

import { cn } from "@/lib/utils";

export interface TextareaProps
	extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
	({ className, ...props }, ref) => {
		return (
			<textarea
				className={cn(
					"flex min-h-[80px] w-full rounded-lg border-2 border-warm-200 bg-white px-3 py-2 text-sm text-warm-900 transition-all duration-200 placeholder:text-warm-400 focus-visible:outline-none focus-visible:border-kake-caramel-400 focus-visible:ring-2 focus-visible:ring-kake-caramel-200 focus-visible:shadow-caramel disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-warm-50 hover:border-warm-300 resize-none",
					className,
				)}
				ref={ref}
				{...props}
			/>
		);
	},
);
Textarea.displayName = "Textarea";

export { Textarea };
