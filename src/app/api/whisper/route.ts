import { unlink, writeFile } from "fs/promises";
import { NextRequest } from "next/server";
import OpenAI from "openai";
import os from "os";
import path from "path";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
export async function POST(req: NextRequest) {
	const formData = await req.formData();
	const file = formData.get("audio") as File;
	if (!file) return Response.json({ error: "No audio file" }, { status: 400 });

	// Save file to disk
	const buffer = Buffer.from(await file.arrayBuffer());
	const tempPath = path.join(os.tmpdir(), `${Date.now()}-audio.webm`);
	await writeFile(tempPath, buffer);

	try {
		const transcription = await openai.audio.transcriptions.create({
			file: require("fs").createReadStream(tempPath),
			model: "whisper-1",
		});
		await unlink(tempPath);
		return Response.json({ transcript: transcription.text });
	} catch (e) {
		await unlink(tempPath);
		return Response.json({ error: "Transcription failed" }, { status: 500 });
	}
}
