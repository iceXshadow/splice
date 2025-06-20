import { google } from "@ai-sdk/google";
import { generateText } from "ai";

export async function POST(req: Request) {
	try {
		const { transcript } = await req.json();
		if (!transcript) return Response.json({ error: "No transcript" }, { status: 400 });

		const { text: correctedTranscript } = await generateText({
			model: google("gemini-2.0-pro"),
			prompt: `The following is a transcript from a voice recognition system. Please correct any errors, unclear phrases, or misheard words, and return the improved transcript:\n\n"${transcript}"`,
		});

		return Response.json({ correctedTranscript });
	} catch (e) {
		return Response.json({ error: "Correction failed" }, { status: 500 });
	}
}
