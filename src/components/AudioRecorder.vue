<script setup>
import { onMounted, ref } from "vue";

const startBtn = ref(null); // these ref value get populated during onMounted() lifecycle
const stopBtn = ref(null);
const audioPlayback = ref(null);

let mediaRecorder;
let audioChunks = []; // ! Store the audio data chunks when they are available

// Get references to UI elements
onMounted(() => {});

const handleStartRecord = async () => {
  if (
    startBtn.value === null ||
    stopBtn.value === null ||
    audioPlayback.value === null
  ) {
    return;
  }

  // Request access to the microphone
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  // Create a MediaRecorder instance
  mediaRecorder = new MediaRecorder(stream);

  // debugger;

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

    // TODO:  integrate with OpenAI whisper model for audio -> text

    // final cleanup
    audioChunks = []; // Reset the chunks array
    startBtn.value.disabled = false;
    stopBtn.value.disabled = true;
  };
};

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
