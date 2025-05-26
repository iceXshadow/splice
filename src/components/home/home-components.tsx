import Image from "next/image";
import { Button } from "../ui/button";

export const Hero = () => {
	return (
		<section className="flex w-full items-center justify-between px-8">
			<div className="max-w-md space-y-4">
				<h2 className="text-2xl font-semibold">Get Interview-Ready with AI-Powered Practice & Feedback</h2>
				<p className="text-muted-foreground">
					Practice coding interviews with AI-generated questions and receive instant feedback.
				</p>

				<Button className="text-primary cursor-pointer bg-blue-500 hover:bg-blue-600">Start an Interview</Button>
			</div>

			<div>
				<Image src="/home-cta.svg" alt="Hero Image" width={256} height={256} />
			</div>
		</section>
	);
};
