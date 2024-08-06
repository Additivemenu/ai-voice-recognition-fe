export function speak(text) {
  // Create a new instance of SpeechSynthesisUtterance
  const utterance = new SpeechSynthesisUtterance(text);

  // Set properties like language, pitch, and rate if needed
  utterance.lang = "en-US";
  utterance.pitch = 1; // Range: 0 to 2
  utterance.rate = 1; // Range: 0.1 to 10
  utterance.volume = 1; // Range: 0 to 1

  // Speak the utterance using the speechSynthesis API
  window.speechSynthesis.speak(utterance);
}
