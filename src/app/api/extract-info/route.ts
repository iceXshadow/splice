// app/api/extract-info/route.ts
import { google } from "@ai-sdk/google";
import { generateText } from "ai";

interface ExtractionResult {
	role?: string;
	level?: string;
	techstack?: string[];
	type?: string;
	confidence: number;
	needsMoreInfo: boolean;
	followUpQuestion?: string;
}

export async function POST(req: Request) {
	try {
		const { transcript, conversationHistory = [] } = await req.json();

		if (!transcript || transcript.trim().length === 0) {
			return Response.json(
				{
					success: false,
					message: "No transcript provided",
				},
				{ status: 400 }
			);
		}

		const conversationContext =
			conversationHistory.length > 0 ? `Previous conversation:\n${conversationHistory.join("\n")}\n\n` : "";

		const { text: extractionResult } = await generateText({
			model: google("gemini-2.0-flash-001"),
			prompt: `${conversationContext}Latest user response: "${transcript}"

Please extract the following information from the user's response and conversation history:

1. Job Role/Position (e.g., "Software Engineer", "Data Scientist", "Product Manager")
2. Experience Level (e.g., "Junior", "Mid-level", "Senior", "Lead")
3. Tech Stack (array of technologies, frameworks, languages they mention)
4. Interview Type Preference (if mentioned: "Technical", "Behavioral", or "Mixed")

Return ONLY a JSON object with this exact structure:
{
  "role": "extracted role or null",
  "level": "extracted level or null", 
  "techstack": ["array", "of", "technologies"] or null,
  "type": "extracted type preference or null",
  "confidence": 0.0-1.0,
  "needsMoreInfo": true/false,
  "followUpQuestion": "question to ask if more info needed or null"
}

Rules:
- Set confidence between 0.0 and 1.0 based on how clear the information is
- Set needsMoreInfo to true if any critical information is missing
- Provide a natural follow-up question if more information is needed
- If the user hasn't provided enough information, ask them to elaborate
- Be lenient with variations in job titles and experience levels
- Extract tech stack from any technologies mentioned, even if not explicitly listed

Examples of good extractions:
- "I'm a senior React developer with 5 years experience" → role: "Software Engineer", level: "Senior", techstack: ["React"]
- "I work as a data scientist using Python and ML" → role: "Data Scientist", techstack: ["Python", "Machine Learning"]
- "I'm looking for a backend engineering role" → role: "Backend Engineer", level: null, needsMoreInfo: true`,
		});

		const parsedResult: ExtractionResult = JSON.parse(extractionResult);

		return Response.json(
			{
				success: true,
				data: parsedResult,
			},
			{ status: 200 }
		);
	} catch (error) {
		console.error("Error extracting information:", error);

		return Response.json(
			{
				success: false,
				message: "An error occurred while extracting information.",
			},
			{ status: 500 }
		);
	}
}
