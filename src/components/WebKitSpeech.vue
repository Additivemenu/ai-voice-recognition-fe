<template>
    <div class="voice-rec" :style="{ backgroundColor: backgroundColor }">
        <h1>Voice Recognition</h1>
        <p>Command: {{ command }}</p>
        <p>Transcript: {{ transcript }}</p>
        <button @click="toggleListening">{{ listening ? 'Stop' : 'Start' }}</button>
    </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue';
import stringSimilarity from 'string-similarity';

export default {
    setup() {
        const transcript = ref('');
        const command = ref('');
        const listening = ref(false);
        const backgroundColor = ref('white');
        let recognition;
        let timeoutId;

        const possibleCommands = [
            'hey tasker',
            'hi tasker',
            'hello tasker',
            'hi'
        ]

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

        const toggleListening = () => {
            if (listening.value) {
                stopListening();
            } else {
                startListening();
            }
        };

        function isSimilar(input) {
            const text = input.toLowerCase().replace(/[^\w\s]/g, '');
            const words = text.split(/\s+/).filter(word => word.length > 0);
            const combinations = words.slice(0, -1).map((word, i) => word + ' ' + words[i + 1]);

            return combinations.some(combination => {
                const isSimilarToAnyCommand = possibleCommands.some(command => {
                    const similarity = stringSimilarity.compareTwoStrings(combination, command);
                    return similarity > 0.7;
                });
                const isRegexMatch = /(hey|hello|hi) task(er)?/i.test(combination);

                return isSimilarToAnyCommand || isRegexMatch;
            });

            return false;
        }

        onMounted(() => {
            if ('webkitSpeechRecognition' in window) {
                recognition = new window.webkitSpeechRecognition();
                recognition.continuous = true;
                recognition.interimResults = true;
                recognition.lang = 'en-US';
                recognition.maxAlternatives = 1;

                recognition.onresult = (event) => {
                    let interimTranscript = '';
                    for (let i = event.resultIndex; i < event.results.length; i++) {
                        const speechText = event.results[i][0].transcript.trim();
                        console.log(speechText)
                        if (event.results[i].isFinal) {
                            const speechText = event.results[i][0].transcript.trim();
                            console.log("Detected speech: ", speechText);
                            if (isSimilar(speechText)) {
                                command.value = 'Hey Tasker';
                                transcript.value = '';
                            } else if (command.value) {
                                transcript.value += speechText + ' ';
                            }
                        } else {
                            interimTranscript += speechText;
                        }
                    }

                    clearTimeout(timeoutId);
                    if (command.value) {
                        timeoutId = setTimeout(() => {
                            command.value = 'Hey Tasker';
                            transcript.value = transcript.value.trim().toLowerCase().replace(/[^\w\s]/g, '');
                            if (transcript.value === 'black' || transcript.value === 'white' || transcript.value === 'red' || transcript.value === 'green' || transcript.value === 'blue') {
                                backgroundColor.value = transcript.value;
                            } else if (transcript.value === 'refresh the page') {
                                window.location.reload();
                            }
                        }, 1000);
                    }
                };

                recognition.onerror = (event) => {
                    if (event.error === 'no-speech') {
                        console.log('Onerror: no speech detected, restarting.');
                        stopListening();
                        setTimeout(startListening, 100);
                    }
                };

                recognition.onend = () => {
                    if (listening.value) {
                        console.log('Onend: restart listening');
                        setTimeout(startListening, 100);
                    }
                };

                startListening();
            } else {
                alert('Unsupported browser');
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
            backgroundColor
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
</style>