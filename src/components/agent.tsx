"use client";

import { useVoiceService } from "@/hooks/useVoiceService";
import { cn } from "@/lib/utils";
import { Profile } from "iconsax-reactjs";
import { useCallback, useEffect, useState } from "react";
import { Button } from "./ui/button";
import { AgentIcon } from "./ui/icons";

enum CallStatus {
	INACTIVE = "INACTIVE",
	CONNECTING = "CONNECTING",
	ACTIVE = "ACTIVE",
	EXTRACTING = "EXTRACTING",
	GENERATING = "GENERATING",
	ENDED = "ENDED",
}

interface AgentProps {
	userName: string;
	onInterviewGenerated?: (interviewData: any) => void;
}

interface ExtractedInfo {
	role?: string;
	level?: string;
	techstack?: string[];
	type?: string;
	confidence: number;
	needsMoreInfo: boolean;
	followUpQuestion?: string;
}

const Agent = ({ userName, onInterviewGenerated }: AgentProps) => {
	const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);
	const [messages, setMessages] = useState<string[]>([]);
	const [conversationHistory, setConversationHistory] = useState<string[]>([]);
	const [extractedInfo, setExtractedInfo] = useState<ExtractedInfo | null>(null);
	const [isProcessing, setIsProcessing] = useState(false);

	const { isListening, isSpeaking, transcript, startListening, stopListening, speak, stopSpeaking, isSupported } =
		useVoiceService();

	const lastMessage = messages[messages.length - 1];

	// Initial greeting
	const startInterview = useCallback(async () => {
		setCallStatus(CallStatus.CONNECTING);
		setMessages([]);
		setConversationHistory([]);
		setExtractedInfo(null);

		const greeting = `Hello ${userName}! I'm your AI interviewer. To get started, please introduce yourself and tell me about your background, the role you're interested in, your experience level, and any technologies you work with.`;

		try {
			await speak(greeting);
			setMessages([greeting]);
			setCallStatus(CallStatus.ACTIVE);
			startListening();
		} catch (error) {
			console.error("Error starting interview:", error);
			setCallStatus(CallStatus.INACTIVE);
		}
	}, [userName, speak, startListening]);

	// Process user's speech input
	const processTranscript = useCallback(
		async (userTranscript: string) => {
			if (!userTranscript.trim() || isProcessing) return;

			setIsProcessing(true);
			setCallStatus(CallStatus.EXTRACTING);
			stopListening();

			// Add user's response to conversation
			const userMessage = `${userName}: ${userTranscript}`;
			setMessages((prev) => [...prev, userMessage]);
			setConversationHistory((prev) => [...prev, userMessage]);

			try {
				// Extract information from the transcript
				const response = await fetch("/api/extract-info", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						transcript: userTranscript,
						conversationHistory: conversationHistory,
					}),
				});

				const result = await response.json();

				if (result.success) {
					const extractionData = result.data as ExtractedInfo;
					setExtractedInfo(extractionData);

					if (extractionData.needsMoreInfo && extractionData.followUpQuestion) {
						// Need more information
						const followUpMessage = `AI: ${extractionData.followUpQuestion}`;
						setMessages((prev) => [...prev, followUpMessage]);
						setConversationHistory((prev) => [...prev, followUpMessage]);

						await speak(extractionData.followUpQuestion);
						setCallStatus(CallStatus.ACTIVE);
						startListening();
					} else if (extractionData.confidence > 0.7) {
						// Sufficient information gathered, generate interview
						await generateInterview(extractionData);
					} else {
						// Low confidence, ask for clarification
						const clarificationMessage =
							"I'd like to make sure I understand correctly. Could you please provide more details about your role, experience level, and the technologies you work with?";
						const aiMessage = `AI: ${clarificationMessage}`;
						setMessages((prev) => [...prev, aiMessage]);
						setConversationHistory((prev) => [...prev, aiMessage]);

						await speak(clarificationMessage);
						setCallStatus(CallStatus.ACTIVE);
						startListening();
					}
				} else {
					throw new Error(result.message);
				}
			} catch (error) {
				console.error("Error processing transcript:", error);
				const errorMessage = "I'm sorry, I had trouble understanding. Could you please repeat that?";
				const aiMessage = `AI: ${errorMessage}`;
				setMessages((prev) => [...prev, aiMessage]);

				await speak(errorMessage);
				setCallStatus(CallStatus.ACTIVE);
				startListening();
			} finally {
				setIsProcessing(false);
			}
		},
		[userName, conversationHistory, isProcessing, stopListening, speak, startListening]
	);

	// Generate interview questions
	const generateInterview = async (info: ExtractedInfo) => {
		setCallStatus(CallStatus.GENERATING);

		const confirmationMessage = `Perfect! I'll now generate interview questions for a ${info.level || "mid-level"} ${info.role} position${info.techstack?.length ? ` focusing on ${info.techstack.join(", ")}` : ""}. This will take just a moment.`;
		const aiMessage = `AI: ${confirmationMessage}`;
		setMessages((prev) => [...prev, aiMessage]);

		await speak(confirmationMessage);

		try {
			const response = await fetch("/api/generate", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					type: info.type || "Mixed",
					role: info.role || "Software Engineer",
					level: info.level || "Mid-level",
					techstack: info.techstack?.join(", ") || "General",
					amount: 10,
					userid: "current-user", // Replace with actual user ID
				}),
			});

			const result = await response.json();

			if (result.success) {
				const successMessage =
					"Great! Your personalized interview questions have been generated. You can now start your practice interview. Good luck!";
				const finalMessage = `AI: ${successMessage}`;
				setMessages((prev) => [...prev, finalMessage]);

				await speak(successMessage);
				setCallStatus(CallStatus.ENDED);

				if (onInterviewGenerated) {
					onInterviewGenerated(result.data);
				}
			} else {
				throw new Error(result.message);
			}
		} catch (error) {
			console.error("Error generating interview:", error);
			const errorMessage = "I'm sorry, there was an error generating your interview questions. Please try again.";
			const aiMessage = `AI: ${errorMessage}`;
			setMessages((prev) => [...prev, aiMessage]);

			await speak(errorMessage);
			setCallStatus(CallStatus.ENDED);
		}
	};

	// Handle transcript changes
	useEffect(() => {
		if (transcript && !isListening && callStatus === CallStatus.ACTIVE) {
			processTranscript(transcript);
		}
	}, [transcript, isListening, callStatus, processTranscript]);

	// Handle call button click
	const handleCallButton = () => {
		switch (callStatus) {
			case CallStatus.INACTIVE:
			case CallStatus.ENDED:
				startInterview();
				break;
			case CallStatus.ACTIVE:
				stopListening();
				stopSpeaking();
				setCallStatus(CallStatus.ENDED);
				break;
			case CallStatus.CONNECTING:
			case CallStatus.EXTRACTING:
			case CallStatus.GENERATING:
				// Don't allow interruption during processing
				break;
		}
	};

	// Determine button text and styles based on callStatus
	const getButtonProps = () => {
		switch (callStatus) {
			case CallStatus.INACTIVE:
			case CallStatus.ENDED:
				return {
					text: "Start Interview Setup",
					className: "bg-blue-500 text-white hover:bg-blue-600",
					showPing: false,
					disabled: false,
				};
			case CallStatus.CONNECTING:
				return {
					text: "Connecting...",
					className: "bg-yellow-500 text-white hover:bg-yellow-600",
					showPing: true,
					disabled: true,
				};
			case CallStatus.ACTIVE:
				return {
					text: isListening ? "Listening..." : "End Setup",
					className: isListening
						? "bg-green-500 text-white hover:bg-green-600"
						: "bg-red-500 text-white hover:bg-red-600",
					showPing: isListening,
					disabled: false,
				};
			case CallStatus.EXTRACTING:
				return {
					text: "Processing...",
					className: "bg-purple-500 text-white hover:bg-purple-600",
					showPing: true,
					disabled: true,
				};
			case CallStatus.GENERATING:
				return {
					text: "Generating Questions...",
					className: "bg-indigo-500 text-white hover:bg-indigo-600",
					showPing: true,
					disabled: true,
				};
			default:
				return {
					text: "Start Interview Setup",
					className: "bg-blue-500 text-white hover:bg-blue-600",
					showPing: false,
					disabled: false,
				};
		}
	};

	const { text, className, showPing, disabled } = getButtonProps();

	if (!isSupported) {
		return (
			<div className="flex h-96 flex-col items-center justify-center gap-4 rounded-lg border p-8">
				<h3 className="text-xl font-semibold text-red-600">Voice Not Supported</h3>
				<p className="text-center text-gray-600">
					Your browser doesn't support voice recognition. Please use a modern browser like Chrome, Edge, or Safari.
				</p>
			</div>
		);
	}

	return (
		<>
			<div className="grid grid-cols-2 gap-4 px-2 max-sm:grid-cols-1 max-sm:px-0">
				<div className="flex h-96 flex-col items-center justify-center gap-2 rounded-lg border">
					<div className="bg-secondary relative flex size-28 items-center justify-center rounded-full border backdrop-blur-2xl">
						<AgentIcon />
						{isSpeaking && <div className="absolute inset-0 animate-pulse rounded-full border-4 border-green-400" />}
					</div>
					<h3 className="text-2xl font-semibold">AI Interviewer</h3>
					{callStatus === CallStatus.ACTIVE && (
						<p className="text-sm text-gray-600">
							{isSpeaking ? "Speaking..." : isListening ? "Listening..." : "Ready"}
						</p>
					)}
				</div>

				<div className="flex h-96 flex-col items-center justify-center gap-2 rounded-lg border">
					<div className="bg-secondary relative flex size-28 items-center justify-center rounded-full border backdrop-blur-2xl">
						<Profile variant="Bold" className="size-20" />
						{isListening && <div className="absolute inset-0 animate-pulse rounded-full border-4 border-blue-400" />}
					</div>
					<h3 className="text-2xl font-semibold">{userName}</h3>
					{isListening && <p className="text-sm text-blue-600">You're speaking...</p>}
				</div>
			</div>

			{/* Current transcript display */}
			{transcript && callStatus === CallStatus.ACTIVE && (
				<div className="rounded-lg border bg-blue-50 px-4 py-2">
					<h4 className="text-sm font-semibold text-blue-800">You're saying:</h4>
					<p className="text-blue-700">{transcript}</p>
				</div>
			)}

			{/* Extracted information display */}
			{extractedInfo && (
				<div className="rounded-lg border bg-green-50 px-4 py-2">
					<h4 className="text-sm font-semibold text-green-800">Extracted Information:</h4>
					<div className="text-sm text-green-700">
						{extractedInfo.role && (
							<p>
								<strong>Role:</strong> {extractedInfo.role}
							</p>
						)}
						{extractedInfo.level && (
							<p>
								<strong>Level:</strong> {extractedInfo.level}
							</p>
						)}
						{extractedInfo.techstack && extractedInfo.techstack.length > 0 && (
							<p>
								<strong>Tech Stack:</strong> {extractedInfo.techstack.join(", ")}
							</p>
						)}
						{extractedInfo.type && (
							<p>
								<strong>Interview Type:</strong> {extractedInfo.type}
							</p>
						)}
						<p>
							<strong>Confidence:</strong> {Math.round(extractedInfo.confidence * 100)}%
						</p>
					</div>
				</div>
			)}

			{/* Messages/Transcript */}
			{messages.length > 0 && (
				<div className="max-h-48 overflow-y-auto rounded-lg border px-4 py-2">
					<h4 className="text-lg font-semibold">Conversation:</h4>
					<div className="space-y-2">
						{messages.map((message, index) => (
							<p
								key={index}
								className={cn("text-sm", message.startsWith("AI:") ? "font-medium text-blue-700" : "text-gray-700")}
							>
								{message}
							</p>
						))}
					</div>
				</div>
			)}

			<div className="flex w-full justify-center">
				<Button className={cn("relative cursor-pointer", className)} onClick={handleCallButton} disabled={disabled}>
					{showPing && <span className="absolute inset-0 animate-ping rounded-md bg-current opacity-30" />}
					<span>{text}</span>
				</Button>
			</div>
		</>
	);
};

export default Agent;
