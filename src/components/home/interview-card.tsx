import { getRandomInterviewCover } from "@/lib/utils";
import dayjs from "dayjs";
import { Calendar, Star1 } from "iconsax-reactjs";
import Image from "next/image";
import Link from "next/link";
import { Button } from "../ui/button";
import DisplayTechIcons from "./display-tech-icons";

const InterviewCard = ({ interviewId, userId, role, type, techstack, createdAt }: InterviewCardProps) => {
	const feedback = null as Feedback | null;
	const normalizedType = /mix/gi.test(type) ? "Mixed" : type;

	const formattedData = dayjs(feedback?.createdAt || createdAt || Date.now()).format("MMM D, YYYY");

	return (
		<div className="relative flex h-60 flex-col gap-2 overflow-hidden rounded-lg border p-4">
			<div className="absolute top-0 right-0 w-fit rounded-bl-md bg-indigo-500 px-3 py-1">
				<p className="text-primary text-sm">{normalizedType}</p>
			</div>

			<Image
				src={getRandomInterviewCover()}
				alt="Interview Cover"
				width={52}
				height={52}
				className="object-fit rounded-full"
			/>

			<h3 className="text-lg font-semibold">{role} Interview</h3>

			<div className="flex flex-row items-center gap-4">
				<div className="flex items-center gap-2">
					<Calendar variant="Bold" className="h-5 w-5" />
					<p className="text-primary text-sm font-medium">{formattedData}</p>
				</div>

				<div className="flex items-center gap-2">
					<Star1 variant="Bold" className="h-5 w-5" />
					<p className="text-primary text-sm font-medium">{feedback?.totalScore || "---"}/100</p>
				</div>
			</div>

			<p className="text-muted-foreground text-sm">
				{feedback?.finalAssessment || "You haven't taken an interview yet. Take it now to improve your skills."}
			</p>

			<div className="flex flex-row items-center justify-between">
				<DisplayTechIcons techStack={techstack} />

				<Button className="text-primary cursor-pointer bg-indigo-500 hover:bg-indigo-600">
					<Link href={feedback ? `/interview/${interviewId}/feedback` : `/interview/${interviewId}`}>
						{feedback ? "View Feedback" : "Start Interview"}
					</Link>
				</Button>
			</div>
		</div>
	);
};

export default InterviewCard;
