import { dummyInterviews } from "@/constants";
import Image from "next/image";
import Link from "next/link";
import { Button } from "../ui/button";
import InterviewCard from "./interview-card";

export const Hero = () => {
	return (
		<section className="flex w-full items-center justify-between px-4">
			<div className="max-w-md space-y-4">
				<h2 className="text-2xl font-semibold max-md:text-xl">
					Get Interview-Ready with AI-Powered Practice & Feedback
				</h2>
				<p className="text-muted-foreground">
					Practice coding interviews with AI-generated questions and receive instant feedback.
				</p>

				<Button asChild className="text-primary cursor-pointer bg-blue-500 hover:bg-blue-600 max-sm:w-full">
					<Link href="/interview">Start an Interview</Link>
				</Button>
			</div>

			<div className="max-sm:hidden">
				<Image src="/home-cta.svg" alt="Hero Image" width={256} height={256} />
			</div>
		</section>
	);
};

export const Interviews = () => {
	return (
		<>
			<section className="space-y-4">
				<h2 className="text-2xl font-semibold">Your Interviews</h2>

				<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
					{/* <p className="text-base font-normal">You haven&apos;t taken any interviews yet.</p> */}
					{dummyInterviews.map((interview) => (
						<InterviewCard key={interview.id} {...interview} />
					))}
				</div>
			</section>

			<section className="space-y-4">
				<h2 className="text-2xl font-semibold">Take an Interview</h2>

				<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
					{/* <p className="text-base font-normal">You haven&apos;t taken any interviews yet.</p> */}
					{dummyInterviews.map((interview) => (
						<InterviewCard key={interview.id} {...interview} />
					))}
				</div>
			</section>
		</>
	);
};
