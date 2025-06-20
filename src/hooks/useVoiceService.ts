// hooks/useVoiceService.ts
import { useCallback, useEffect, useRef, useState } from "react";

interface UseVoiceServiceReturn {
	isListening: boolean;
	isSpeaking: boolean;
	transcript: string;
	startListening: () => void;
	stopListening: () => void;
	speak: (text: string) => Promise<void>;
	stopSpeaking: () => void;
	isSupported: boolean;
}

export const useVoiceService = (): UseVoiceServiceReturn => {
	const [isListening, setIsListening] = useState(false);
	const [isSpeaking, setIsSpeaking] = useState(false);
	const [transcript, setTranscript] = useState("");
	const [isSupported, setIsSupported] = useState(false);

	const recognitionRef = useRef<SpeechRecognition | null>(null);
	const synthesisRef = useRef<SpeechSynthesis | null>(null);
	const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

	useEffect(() => {
		// Check if browser supports Speech Recognition and Speech Synthesis
		const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
		const speechSynthesis = window.speechSynthesis;

		if (SpeechRecognition && speechSynthesis) {
			setIsSupported(true);

			// Initialize Speech Recognition
			recognitionRef.current = new SpeechRecognition();
			recognitionRef.current.continuous = true;
			recognitionRef.current.interimResults = true;
			recognitionRef.current.lang = "en-US";

			// Initialize Speech Synthesis
			synthesisRef.current = speechSynthesis;

			// Setup recognition event handlers
			recognitionRef.current.onstart = () => {
				setIsListening(true);
			};

			recognitionRef.current.onend = () => {
				setIsListening(false);
			};

			recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
				let finalTranscript = "";
				let interimTranscript = "";

				for (let i = event.resultIndex; i < event.results.length; i++) {
					const transcript = event.results[i][0].transcript;
					if (event.results[i].isFinal) {
						finalTranscript += transcript;
					} else {
						interimTranscript += transcript;
					}
				}

				setTranscript(finalTranscript || interimTranscript);
			};

			recognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
				console.error("Speech recognition error:", event.error);
				setIsListening(false);
			};
		} else {
			setIsSupported(false);
		}

		return () => {
			if (recognitionRef.current) {
				recognitionRef.current.stop();
			}
			if (synthesisRef.current) {
				synthesisRef.current.cancel();
			}
		};
	}, []);

	const startListening = useCallback(() => {
		if (recognitionRef.current && !isListening) {
			setTranscript("");
			recognitionRef.current.start();
		}
	}, [isListening]);

	const stopListening = useCallback(() => {
		if (recognitionRef.current && isListening) {
			recognitionRef.current.stop();
		}
	}, [isListening]);

	const speak = useCallback(async (text: string): Promise<void> => {
		return new Promise((resolve, reject) => {
			if (!synthesisRef.current) {
				reject(new Error("Speech synthesis not supported"));
				return;
			}

			// Stop any ongoing speech
			synthesisRef.current.cancel();

			const utterance = new SpeechSynthesisUtterance(text);
			utteranceRef.current = utterance;

			// Configure voice settings
			utterance.rate = 0.9;
			utterance.pitch = 1;
			utterance.volume = 1;

			// Try to use a natural sounding voice
			const voices = synthesisRef.current.getVoices();
			const preferredVoice = voices.find(
				(voice) => voice.name.includes("Google") || voice.name.includes("Microsoft") || voice.lang.startsWith("en")
			);
			if (preferredVoice) {
				utterance.voice = preferredVoice;
			}

			utterance.onstart = () => {
				setIsSpeaking(true);
			};

			utterance.onend = () => {
				setIsSpeaking(false);
				resolve();
			};

			utterance.onerror = (event) => {
				setIsSpeaking(false);
				reject(new Error(`Speech synthesis error: ${event.error}`));
			};

			synthesisRef.current.speak(utterance);
		});
	}, []);

	const stopSpeaking = useCallback(() => {
		if (synthesisRef.current) {
			synthesisRef.current.cancel();
			setIsSpeaking(false);
		}
	}, []);

	return {
		isListening,
		isSpeaking,
		transcript,
		startListening,
		stopListening,
		speak,
		stopSpeaking,
		isSupported,
	};
};
