"use client";

import { cn } from "@/lib/utils";
import { Profile } from "iconsax-reactjs";
import { useState } from "react";
import { Button } from "./ui/button";
import { AgentIcon } from "./ui/icons";

enum CallStatus {
	INACTIVE = "INACTIVE",
	CONNECTING = "CONNECTING",
	ACTIVE = "ACTIVE",
	ENDED = "ENDED",
}

interface AgentProps {
	userName: string;
}

const Agent = ({ userName }: AgentProps) => {
	const [callStatus] = useState<CallStatus>(CallStatus.ENDED);
	// const callStatus = CallStatus.ENDED; // Simulating call status for demonstration
	const isSpeaking = false;
	const messages = ["What is your name?", "My name is John Doe, nice to meet you!"];

	const lastMessage = messages[messages.length - 1];

	// Determine button text and styles based on callStatus
	const getButtonProps = () => {
		switch (callStatus) {
			case CallStatus.INACTIVE:
			case CallStatus.ENDED:
				return {
					text: "Start Call",
					className: "bg-blue-500 text-white hover:bg-blue-600",
					showPing: false,
				};
			case CallStatus.CONNECTING:
				return {
					text: "Connecting...",
					className: "bg-yellow-500 text-white hover:bg-yellow-600",
					showPing: true,
				};
			case CallStatus.ACTIVE:
				return {
					text: "End Call",
					className: "bg-red-500 text-white hover:bg-red-600",
					showPing: false,
				};
			default:
				return {
					text: "Start Call",
					className: "bg-blue-500 text-white hover:bg-blue-600",
					showPing: false,
				};
		}
	};

	const { text, className, showPing } = getButtonProps();

	return (
		<>
			<div className="grid grid-cols-2 gap-4 px-2 max-sm:grid-cols-1 max-sm:px-0">
				<div className="flex h-96 flex-col items-center justify-center gap-2 rounded-lg border">
					<div className="bg-secondary flex size-28 items-center justify-center rounded-full border backdrop-blur-2xl">
						<AgentIcon />
						{isSpeaking && <span className="animate-speak" />}
					</div>
					<h3 className="text-2xl font-semibold">AI Interviewer</h3>
				</div>

				<div className="flex h-96 flex-col items-center justify-center gap-2 rounded-lg border">
					<div className="bg-secondary flex size-28 items-center justify-center rounded-full border backdrop-blur-2xl">
						<Profile variant="Bold" className="size-20" />
						{/* {isSpeaking && <span className="animate-speak" />} */}
					</div>
					<h3 className="text-2xl font-semibold">{userName}</h3>
				</div>
			</div>

			{messages.length > 0 && (
				<div className="rounded-lg border px-4 py-2">
					<div>
						<h4 className="text-lg font-semibold">Transcript:</h4>
						<p key={lastMessage}>{lastMessage}</p>
					</div>
				</div>
			)}

			<div className="flex w-full justify-center">
				<Button className={cn("relative cursor-pointer", className)}>
					{showPing && <span className="absolute inset-0 animate-ping rounded-md bg-current opacity-30" />}
					<span>{text}</span>
				</Button>
			</div>
		</>
	);
};

export default Agent;
