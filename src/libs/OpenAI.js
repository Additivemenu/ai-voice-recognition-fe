import { OPENAI_API_KEY } from "@/env";
import { parse } from "vue/compiler-sfc";

// TODO: this should be on server-side
export async function transcribeAudioWithOpenAI(audioFile) {
  const formData = new FormData();
  formData.append("file", audioFile);
  formData.append("model", "whisper-1");

  // Send the request using fetch
  const resData = await fetch(
    "https://api.openai.com/v1/audio/transcriptions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: formData,
    }
  ).then((response) => response.json());

  console.log(resData);
  return resData.text;
}

export async function parseTranscriptToCommands(transcript) {
  const url = "https://api.openai.com/v1/chat/completions";
  const apiKey = OPENAI_API_KEY; // Replace this with your actual API key

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${apiKey}`,
  };

  const data = {
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content:
          `You are a helpful assistant for parsing natural language commands. Please help me with the following tasks:` +
          "1. differentiate the command type from allowed command list: ['change_background_color', 'refresh_page'], if not found return null for command_type field" +
          "2. extract the command arguments from the command" +
          "for example, if the command is 'hey change the background color to red', the arguments are in json format: {'command_type': 'change_background_color', 'color': 'red'}, note the color value is a css color name",
      },
      {
        role: "user",
        content: transcript,
      },
    ],
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    // console.log(result);

    // debugger;

    const jsonRes = extractAndParseJson(result.choices[0].message.content);
    if (jsonRes.command_type === null) {
      throw new Error("Command not understood. Please try again.");
    }

    return jsonRes;
  } catch (error) {
    console.error("Error fetching completion:", error);
  }
}

const extractAndParseJson = (str) => {
  const jsonContent = str.match(/```json([\s\S]*?)```/)[1].trim();
  return JSON.parse(jsonContent);
};
