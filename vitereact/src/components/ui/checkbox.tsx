import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

const Checkbox = React.forwardRef<
	React.ElementRef<typeof CheckboxPrimitive.Root>,
	React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
	<CheckboxPrimitive.Root
		ref={ref}
		className={cn(
			"peer h-4 w-4 shrink-0 rounded border-2 border-warm-300 bg-white transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kake-caramel-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:gradient-caramel data-[state=checked]:text-white data-[state=checked]:border-kake-caramel-500 hover:border-kake-caramel-400",
			className,
		)}
		{...props}
	>
		<CheckboxPrimitive.Indicator
			className={cn("flex items-center justify-center text-current")}
		>
			<Check className="h-4 w-4" />
		</CheckboxPrimitive.Indicator>
	</CheckboxPrimitive.Root>
));
Checkbox.displayName = CheckboxPrimitive.Root.displayName;

export { Checkbox };
