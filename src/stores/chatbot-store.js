import { defineStore } from "pinia";
import { ref } from "vue";

// You can name the return value of `defineStore()` anything you want,
// but it's best to use the name of the store and surround it with `use`
// and `Store` (e.g. `useUserStore`, `useCartStore`, `useProductStore`)
// the first argument is a unique id of the store across your application
export const useChatbotStore = defineStore("chatbot", () => {
  // other options...
  const isChatbotActive = ref(false); // ! only when the chatbot is active should the system process user voice tasks

  function toggleChatbot() {
    isChatbotActive.value = !isChatbotActive.value;
  }

  return {
    isChatbotActive,
    toggleChatbot,
  };
});
