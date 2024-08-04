import { OPENAI_KEY } from "@/env";
import OpenAI from "openai";

const openai = new OpenAI(api_key=OPENAI_KEY);

export async function transcribeAudioWithOpenAI() {
  const transcription = await openai.audio.transcriptions.create({
    file: '123',  // TODO: Replace with the actual file ID
    model: "whisper-1",
  });

  console.log(transcription.text);
  return transcription.text;
}

