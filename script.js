/***********************
  CONFIG
************************/
const OPENAI_API_KEY = "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"; // demo only

/***********************
  ELEMENTS
************************/
const timeEl = document.getElementById("time");
const avatar = document.getElementById("aiAvatar");
const voiceBar = document.querySelector(".voice-bar");
const textDisplay = document.getElementById("textDisplay");
const textInput = document.getElementById("textInput");
const sendBtn = document.getElementById("sendBtn");

/***********************
  TIME (WITH SECONDS) - FIXED
************************/
function updateTime() {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  timeEl.textContent = `${hours}:${minutes}:${seconds}`;
}
setInterval(updateTime, 1000);
updateTime();

/***********************
  CURSOR FOLLOW (SMOOTH)
************************/
let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;
let avatarX = mouseX;
let avatarY = mouseY;

document.addEventListener("mousemove", (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
});

function animateAvatar() {
  avatarX += (mouseX - avatarX) * 0.05;
  avatarY += (mouseY - avatarY) * 0.05;

  avatar.style.transform = `translate(${avatarX - window.innerWidth / 2}px, ${avatarY - window.innerHeight / 2}px)`;

  requestAnimationFrame(animateAvatar);
}
animateAvatar();

/***********************
  SPEECH SYNTHESIS
************************/
function speak(text) {
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = "hi-IN";

  utter.onstart = () => {
    voiceBar.classList.add("speaking");
  };

  utter.onend = () => {
    voiceBar.classList.remove("speaking");
  };

  speechSynthesis.speak(utter);
}

/***********************
  DISPLAY TEXT
************************/
function displayText(text) {
  textDisplay.textContent = text;
  textDisplay.classList.add("show");
  setTimeout(() => {
    textDisplay.classList.remove("show");
  }, 5000); // Hide after 5 seconds
}

/***********************
  GREETING (AUTO)
************************/
window.onload = () => {
  setTimeout(() => {
    speak("Hey dost, main ready hoon. Bolo ya likho, main sun raha hoon.");
  }, 1200);
};

/***********************
  SPEECH RECOGNITION (ALWAYS ACTIVE)
************************/
const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

if (SpeechRecognition) {
  const recognition = new SpeechRecognition();
  recognition.lang = "hi-IN";
  recognition.continuous = true;
  recognition.interimResults = false;

  recognition.start();

  recognition.onresult = (e) => {
    const text = e.results[e.results.length - 1][0].transcript;
    handleUserMessage(text, false); // false for voice
  };

  recognition.onend = () => {
    recognition.start(); // Restart to keep it always active
  };
}

/***********************
  TEXT INPUT
************************/
sendBtn.addEventListener("click", () => {
  const text = textInput.value.trim();
  if (!text) return;
  textInput.value = "";
  handleUserMessage(text, true); // true for text
});

/***********************
  AI BRAIN
************************/
async function handleUserMessage(userText, isTextInput) {
  if (!isTextInput) {
    speak("Hmm… soch raha hoon.");
  } else {
    displayText("Hmm… soch raha hoon.");
  }

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
          {
            role: "system",
            content:
              "Tu ek close dost jaisa AI hai. Friendly, simple Hindi me jawab deta hai."
          },
          { role: "user", content: userText }
        ]
      })
    });

    const data = await res.json();
    const reply = data.choices[0].message.content;

    if (isTextInput) {
      displayText(reply);
    } else {
      speak(reply);
    }

  } catch (err) {
    const errorMsg = "Bhai thoda network ya key issue lag raha hai.";
    if (isTextInput) {
      displayText(errorMsg);
    } else {
      speak(errorMsg);
    }
    console.error(err);
  }
}

/***********************
  VOICE BAR (MIC REACTIVE DOTS)
************************/
navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
  const audioCtx = new AudioContext();
  const mic = audioCtx.createMediaStreamSource(stream);
  const analyser = audioCtx.createAnalyser();
  analyser.fftSize = 256;

  mic.connect(analyser);
  const dataArray = new Uint8Array(analyser.frequencyBinCount);

  function animateVoice() {
    analyser.getByteFrequencyData(dataArray);
    let volume = dataArray.reduce((a, b) => a + b) / dataArray.length;
    const scale = Math.min(2, 1 + volume / 50); // Scale based on volume
    document.querySelectorAll('.dot').forEach(dot => {
      dot.style.transform = `scale(${scale})`;
    });
    requestAnimationFrame(animateVoice);
  }
  animateVoice();
}).catch(err => console.log('Microphone access denied'));
