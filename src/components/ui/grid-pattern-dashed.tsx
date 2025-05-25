"use client";

import { GridPattern } from "@/components/magicui/grid-pattern";
// import { cn } from "@/lib/utils";

export function GridPatternDashed() {
	return (
		<div className="bg-background relative flex size-full items-center justify-center overflow-hidden rounded-lg border p-20">
			<GridPattern
				width={64}
				height={64}
				x={-1}
				y={-1}
				strokeDasharray={"4 2"}
				// className={cn("[mask-image:radial-gradient(300px_circle_at_center,white,transparent)]")}
			/>
		</div>
	);
}
