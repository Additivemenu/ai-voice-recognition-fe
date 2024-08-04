import { OPENAI_KEY } from "@/env";

export async function transcribeAudioWithOpenAI(audioFile) {
  const formData = new FormData();
  formData.append("file", audioFile);
  formData.append("model", "whisper-1");

  // Send the request using fetch
  const resData = await fetch("https://api.openai.com/v1/audio/transcriptions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENAI_KEY}`,
    },
    body: formData,
  }).then((response) => response.json());

  console.log(resData);
  return resData.text;
}
