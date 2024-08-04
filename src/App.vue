<script setup>
import AudioRecorder from "./components/AudioRecorder.vue";
</script>

<template>
  <main>
    <div class="voice-control">
      <textarea
        class="voice-text"
        placeholder="Type your message here..."
      ></textarea>
    </div>

    <AudioRecorder />
  </main>
</template>

<style scoped></style>
