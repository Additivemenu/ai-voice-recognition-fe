<script setup>
import AudioRecorder from "./components/AudioRecorder.vue";
import { onMounted, ref } from "vue";
import { useChatbotStore } from "@/stores/chatbot-store.js";

const chatbotStore = useChatbotStore();


const note = ref("");
const setNote = (textContent) => {
  note.value = textContent;
};
</script>

<template>
  <main>
    <div class="chatbot-live" :style="{ background: chatbotStore.isChatbotActive ? 'lightgreen' : 'grey' }">chatbot</div>

    <div class="voice-control">
      <textarea
        class="note-text"
        placeholder="Type your message here..."
        :value="note"
      ></textarea>
    </div>

    <AudioRecorder :setNote="setNote" />
  </main>
</template>

<style scoped>
.note-text {
  resize: vertical;
  width: 100%;
  max-height: 300px;
  font-size: 1.5rem;
  padding: 1rem;
  margin-bottom: 1rem;
  border: 1px solid #ccc;
  border-radius: 5px;
}

.chatbot-live {
  height: 100px;
  width: 100px;
  text-align: center;
}
</style>
