import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
	"inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-kake-caramel-400 focus:ring-offset-2 shadow-soft",
	{
		variants: {
			variant: {
				default:
					"border-transparent gradient-caramel text-white hover:shadow-caramel",
				secondary:
					"border-transparent bg-kake-cream-400 text-kake-chocolate-700 hover:bg-kake-cream-500",
				destructive:
					"border-transparent bg-kake-berry-500 text-white hover:bg-kake-berry-600",
				outline: "border-kake-caramel-400 text-kake-caramel-700 bg-white hover:bg-kake-cream-100",
			},
		},
		defaultVariants: {
			variant: "default",
		},
	},
);

export interface BadgeProps
	extends React.HTMLAttributes<HTMLDivElement>,
		VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
	return (
		<div className={cn(badgeVariants({ variant }), className)} {...props} />
	);
}

export { Badge, badgeVariants };
