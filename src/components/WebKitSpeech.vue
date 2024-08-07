<template>
  <div class="voice-rec" :style="{ backgroundColor: backgroundColor }">
    <h1>Voice Recognition</h1>
    <p>Command: {{ command }}</p>
    <p>Transcript: {{ transcript }}</p>
    <button @click="toggleListening">{{ listening ? "Stop" : "Start" }}</button>
    <transition name="fade">
      <p v-if="taskerActived">Tasker is listening...</p>
    </transition>
    <transition name="fade">
      <p v-if="taskerProcessing">Processing...</p>
    </transition>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from "vue";
import stringSimilarity from "string-similarity";
import { parseTranscriptToCommands } from "@/libs/OpenAI";
import { speak } from "@/libs/speak";

export default {
  setup() {
    const transcript = ref(""); // store the transcript of user audio
    const command = ref(""); // indicate if is in command mode. Under command mode, web page would respond to the user audio
    const listening = ref(false); // indicate if the web page is listening to user audio. if true, then web page can be further turned to command mode and respond to user audio
    const backgroundColor = ref("white"); // represent command response
    const taskerActived = ref(false); // indicate if the tasker is active
    const taskerProcessing = ref(false); // indicate if the tasker is processing
    let recognition;
    let timeoutId; // !

    const possibleCommands = [
      "hey tasker",
      "hi tasker",
      "hello tasker",
      "hey task",
      "hi task",
      "hello task",
      "ok tasker",
      "okay tasker",
      "ok task",
      "okay task"
    ];

    const startListening = () => {
      if (recognition) {
        recognition.start();
        listening.value = true;
      }
    };

    const stopListening = () => {
      if (recognition) {
        recognition.stop();
        listening.value = false;
      }
    };

    const toggleListening = async () => {
      if (listening.value) {
        await speak("Stop Listening");
        stopListening();
      } else {
        await speak("I am Listening");
        startListening();
      }
    };

    function isSimilar(input) {
      const text = input.toLowerCase().replace(/[^\w\s]/g, "");
      const words = text.split(/\s+/).filter((word) => word.length > 0);
      const combinations = words
        .slice(0, -1)
        .map((word, i) => word + " " + words[i + 1]);

      return combinations.some((combination) => {
        const isSimilarToAnyCommand = possibleCommands.some((command) => {
          const similarity = stringSimilarity.compareTwoStrings(
            combination,
            command
          );
          return similarity > 0.7;
        });
        const isRegexMatch = /(hey|hello|hi) task(er)?/i.test(combination);

        return isSimilarToAnyCommand || isRegexMatch;
      });
    }

    // ! init recognition and start recognizing speech
    onMounted(() => {
      if ("webkitSpeechRecognition" in window) {
        recognition = new window.webkitSpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = "en-AU";
        recognition.maxAlternatives = 3;

        // ! parsing the speech recognition results into string
        recognition.onresult = (event) => {
          // SpeechRecognitionEvent
          let interimTranscript = "";

          // the speech recognition results are filling in the event.results word by word, but the event can automatically merge the words into sentence
          // -> so onresult handler is executed multiple times for each word, but the final result is merged into a sentence
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const alternatives = event.results[i];
            const speechText = alternatives[0].transcript.trim();
            console.log("option1: ", speechText);

            // check if any alternative speech text is similar to any of the possible commands
            let option2 = '';
            let option3 = '';
            if (alternatives.length > 1) {
              option2 = alternatives[1].transcript.trim();
              console.log("option2: ", option2);
            }
            if (alternatives.length > 2) {
              option3 = alternatives[2].transcript.trim();
              console.log("option3: ", option3);
            }
            
            if (!(isSimilar(speechText) || isSimilar(option2) || isSimilar(option3))) {
              return;
            }

            // display speech recognition after the taskr is activated
            taskerActived.value = true;
            command.value = "Taskr";
            transcript.value = speechText
                .trim()
                .toLowerCase()
                .replace(/[^\w\s]/g, "");

            // TODO: how is web speech api determine if it is final?
            if (event.results[i].isFinal) {
              // user has stopped speaking
              const speechText = event.results[i][0].transcript.trim();
              console.log("Detected speech: ", speechText); // ! this is the final result of user speech

              // ! response to the user audio
              timeoutId = setTimeout(async () => {
                // step1: parse the transcript in natural language to command
                // TODO: probably would need AI model to parse the transcript to pre-defined script input arguments
                try {
                  taskerProcessing.value = true;
                  const result = await parseTranscriptToCommands(speechText);

                  console.log(result);

                  // step2: run the script based on the parsed transcript -> command + strategy pattern to handle different commands and payload
                  if (result.command_type === "change_background_color") {
                    backgroundColor.value = result.color.toLowerCase();
                  } else if (result.command_type === "refresh_page") {
                    window.location.reload();
                  }

                  // step3: clean up the command and transcript
                  command.value = "";
                  transcript.value = "";
                  taskerActived.value = false;
                  taskerProcessing.value = false;
                } catch (error) {
                  await speak(
                    "sorry, I cannot understand your command, can you please repeat?"
                  );
                  alert("Failed to parse the transcript to command");

                  console.error(error);
                  // step3: clean up the command and transcript
                  command.value = "";
                  transcript.value = "";
                  taskerActived.value = false;
                  taskerProcessing.value = false;
                }
              }, 1000);
            } else {
              // user is still speaking
              interimTranscript += speechText;

              // ! debouncing
              if (timeoutId) {
                clearTimeout(timeoutId);
              }
            }
          }
        };

        recognition.onerror = (event) => {
          if (event.error === "no-speech") {
            console.log("Onerror: no speech detected, restarting.");
            stopListening();
            setTimeout(startListening, 100);
          }
        };

        recognition.onend = () => {
          if (listening.value) {
            console.log("Onend: restart listening");
            setTimeout(startListening, 100);
          }
        };

        startListening();
      } else {
        alert("Unsupported browser");
      }
    });

    onUnmounted(() => {
      stopListening();
    });

    return {
      transcript,
      command,
      listening,
      toggleListening,
      backgroundColor,
      taskerActived,
      taskerProcessing,
    };
  },
};
</script>

<style scoped>
h1 {
  color: #333;
}

p {
  font-size: 18px;
  color: #555;
}

.voice-rec {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  width: 100vw;
  text-align: center;
  padding: 20px;
  box-sizing: border-box;
  margin: 0;
}

button {
  margin-top: 20px;
  padding: 10px 20px;
  font-size: 16px;
  cursor: pointer;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.5s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
