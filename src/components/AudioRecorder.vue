<script setup>
import { onMounted, ref } from "vue";
import { transcribeAudioWithOpenAI } from "@/libs/OpenAI";
import { useChatbotStore } from "@/stores/chatbot-store.js";

const props = defineProps({
  setNote: {
    type: Function,
    required: true,
  },
});
const chatbotStore = useChatbotStore();

const startBtn = ref(null); // these ref value get populated during onMounted() lifecycle
const stopBtn = ref(null);
const audioPlayback = ref(null);

let mediaRecorder;
let audioChunks = []; // ! Store the audio data chunks when they are available

// TODO: how to trigger the start record and end record when user speaks? -> not using buttons
// TODO: add debouncing to avoid multiple transcriptions
const handleStartRecord = async () => {
  if (
    startBtn.value === null ||
    stopBtn.value === null ||
    audioPlayback.value === null
  ) {
    return;
  }

  // Request access to the microphone
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true }); //FIXME: this should be turn on when user access page
  // Create a MediaRecorder instance
  mediaRecorder = new MediaRecorder(stream);

  // Start recording
  mediaRecorder.start();
  startBtn.value.disabled = true;
  stopBtn.value.disabled = false;

  // ! Store the audio data chunks when they are available
  mediaRecorder.ondataavailable = (event) => {
    audioChunks.push(event.data);
  };

  // When the recording is stopped, create an audio Blob and set it as the source of the audio element
  mediaRecorder.onstop = async () => {
    const audioBlob = new Blob(audioChunks, { type: "audio/mp3" }); // ! chunk data to blob obj

    // Create a URL for the audio blob and set it as the audio source
    const audioUrl = URL.createObjectURL(audioBlob);
    audioPlayback.value.src = audioUrl; // ! feed the audio to the audio element

    // audioBlob -> audioFile (mp3)
    const audioFile = new File([audioBlob], "audio.mp3", { type: "audio/mp3" });

    // query OpenAI: audioFile -> transcribedText
    try {
      const transcribedText = await transcribeAudioWithOpenAI(audioFile);

      // Toggle chatbot if the transcribed text contains the trigger magic word
      const isTriggerWord = /hey,? tasker/.test(transcribedText.toLowerCase());
      if (isTriggerWord && !chatbotStore.isChatbotActive) {
        chatbotStore.toggleChatbot();
      }

      const isCloseWord = /tasker,? close/.test(transcribedText.toLowerCase());
      if (isCloseWord & chatbotStore.isChatbotActive) {
        chatbotStore.toggleChatbot();
      }

      // TODO: respond to the transcribed text -> various actions based on the transcribed text (should hand over to action handler interface)
      if (chatbotStore.isChatbotActive) {
        props.setNote(transcribedText);
      }
    } catch (error) {
      console.error(error);
    } finally {
      // final cleanup
      audioChunks = []; // Reset the chunks array
      startBtn.value.disabled = false;
      stopBtn.value.disabled = true;
    }
  };
};

// TODO: add debouncing to avoid multiple transcriptions
const handleStopRecord = () => {
  mediaRecorder.stop();
};
</script>

<template>
  <div class="voice-record">
    <h1>Voice Recorder</h1>
    <button id="startBtn" ref="startBtn" @click="handleStartRecord">
      Start Recording
    </button>
    <button id="stopBtn" ref="stopBtn" @click="handleStopRecord" disabled>
      Stop Recording
    </button>

    <h2>Recorded Audio:</h2>
    <audio id="audioPlayback" ref="audioPlayback" controls></audio>
  </div>
</template>

<style scoped></style>
