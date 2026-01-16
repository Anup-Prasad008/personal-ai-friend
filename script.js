const OPENAI_API_KEY = "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"; // demo only

const statusDot = document.getElementById("sidebar").firstElementChild;
const timeEl = document.getElementById("time");
const weatherEl = document.getElementById("weather");
const textInput = document.getElementById('textInput');
const voiceSelect = document.getElementById('voiceSelect');

/* ---------- TIME ---------- */
function updateTime() {
  const now = new Date();
  timeEl.textContent = now.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit"
  });
}
setInterval(updateTime, 1000);
updateTime();

/* ---------- WEATHER (Faridabad) ---------- */
async function loadWeather() {
  weatherEl.textContent = "Faridabad • Loading...";
  // Static professional display (API-free for GitHub Pages)
  weatherEl.textContent = "Faridabad • Today • Clear";
}
loadWeather();

/* ---------- VOICE SETUP ---------- */
const synth = window.speechSynthesis;

// Populate voice dropdown and prioritize female voices for friendly/caring tone
function populateVoices() {
  const voices = synth.getVoices();
  voiceSelect.innerHTML = '';
  let femaleVoices = [];
  let otherVoices = [];

  voices.forEach(voice => {
    const option = document.createElement('option');
    option.value = voice.name;
    option.textContent = `${voice.name} (${voice.lang})`;

    // Prioritize female voices (add more keywords if needed)
    if (voice.name.toLowerCase().includes('female') || voice.name.toLowerCase().includes('girl') || 
        voice.name.toLowerCase().includes('zira') || voice.name.toLowerCase().includes('hazel') || 
        voice.name.toLowerCase().includes('samantha') || voice.name.toLowerCase().includes('victoria') ||
        voice.name.toLowerCase().includes('karen') || voice.name.toLowerCase().includes('susan')) {
      femaleVoices.push(option);
    } else {
      otherVoices.push(option);
    }
  });

  // Add female voices first, then others
  femaleVoices.forEach(opt => voiceSelect.appendChild(opt));
  otherVoices.forEach(opt => voiceSelect.appendChild(opt));

  // Auto-select the first female voice if available
  if (femaleVoices.length > 0) {
    voiceSelect.value = femaleVoices[0].value;
  }
}

// Load voices
populateVoices();
if (speechSynthesis.onvoiceschanged !== undefined) {
  speechSynthesis.onvoiceschanged = populateVoices;
}

// Updated speak function with voice selection and caring settings
function speak(text) {
  if (synth.speaking) synth.cancel(); // Stop any ongoing speech
  const utterance = new SpeechSynthesisUtterance(text);
  const selectedVoice = voiceSelect.value;
  const voices = synth.getVoices();
  utterance.voice = voices.find(voice => voice.name === selectedVoice) || voices[0];

  // Friendly/caring settings: Hindi lang, slower rate, higher pitch
  utterance.lang = "hi-IN"; // Hindi for responses
  utterance.rate = 0.8; // Slower for caring feel
  utterance.pitch = 1.2; // Higher pitch for friendliness
  utterance.volume = 1; // Full volume

  // Update status dot
  statusDot.className = "status-dot speaking";
  utterance.onend = () => statusDot.className = "status-dot";
  synth.speak(utterance);
}

/* ---------- VOICE RECOGNITION ---------- */
const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
recognition.lang = "hi-IN";

/* ---------- GREETING ---------- */
window.onload = () => {
  setTimeout(() => {
    speak("नमस्ते दोस्त, मैं यहीं हूँ। जब बोलना हो, मुझे कॉल करो।"); // Friendly Hindi greeting
  }, 1000);
};

/* ---------- LISTEN (Voice or Click) ---------- */
document.body.addEventListener("click", () => {
  statusDot.className = "status-dot listening";
  recognition.start();
});

// Handle voice input
recognition.onresult = async (e) => {
  const userText = e.results[0][0].transcript;
  console.log("User said:", userText); // For debugging

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "तू एक करींग और फ्रेंडली दोस्त जैसा AI है। जवाब हिंदी में दे और हमेशा प्यार से बात कर।" }, // Caring, friendly system prompt in Hindi
          { role: "user", content: userText }
        ]
      })
    });

    const data = await res.json();
    const aiResponse = data.choices[0].message.content;
    speak(aiResponse);
  } catch (error) {
    console.error("Error:", error);
    speak("क्षमा करें, कुछ गड़बड़ हो गई है। फिर से कोशिश करें।"); // Error message in Hindi
  }
};

// Handle text input (type and press Enter)
textInput.addEventListener('keypress', async (e) => {
  if (e.key === 'Enter') {
    const userText = textInput.value.trim();
    if (userText) {
      textInput.value = ''; // Clear input
      console.log("User typed:", userText); // For debugging

      try {
        const res = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${OPENAI_API_KEY}`
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [
              { role: "system", content: "तू एक करींग और फ्रेंडली दोस्त जैसा AI है। जवाब हिंदी में दे और हमेशा प्यार से बात कर।" },
              { role: "user", content: userText }
            ]
          })
        });

        const data = await res.json();
        const aiResponse = data.choices[0].message.content;
        speak(aiResponse);
      } catch (error) {
        console.error("Error:", error);
        speak("क्षमा करें, कुछ गड़बड़ हो गई है। फिर से कोशिश करें।");
      }
    }
  }
});

// Optional: Voice change listener for instant feedback
voiceSelect.addEventListener('change', () => {
  console.log('Voice changed to:', voiceSelect.value);
});
