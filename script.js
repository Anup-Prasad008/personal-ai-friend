/***********************
  CONFIG
************************/
const OPENAI_API_KEY = "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"; // demo only

/***********************
  ELEMENTS
************************/
const timeEl = document.getElementById("time");
const avatar = document.getElementById("aiAvatar");
const voiceLevel = document.getElementById("voiceLevel");
const textInput = document.getElementById("textInput");
const sendBtn = document.getElementById("sendBtn");

/***********************
  TIME (WITH SECONDS)
************************/
function updateTime() {
  const now = new Date();
  timeEl.textContent = now.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });
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
    voiceLevel.style.animation = "none";
    voiceLevel.style.width = "80%";
  };

  utter.onend = () => {
    voiceLevel.style.width = "20%";
    voiceLevel.style.animation = "voiceIdle 1.5s ease-in-out infinite";
  };

  speechSynthesis.speak(utter);
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
  SPEECH RECOGNITION
************************/
const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

const recognition = new SpeechRecognition();
recognition.lang = "hi-IN";
recognition.continuous = false;

document.addEventListener("click", () => {
  recognition.start();
});

recognition.onresult = (e) => {
  const text = e.results[0][0].transcript;
  handleUserMessage(text);
};

/***********************
  TEXT INPUT
************************/
sendBtn.addEventListener("click", () => {
  const text = textInput.value.trim();
  if (!text) return;
  textInput.value = "";
  handleUserMessage(text);
});

/***********************
  AI BRAIN
************************/
async function handleUserMessage(userText) {
  speak("Hmm… soch raha hoon.");

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
    speak(reply);

  } catch (err) {
    speak("Bhai thoda network ya key issue lag raha hai.");
    console.error(err);
  }
}

/***********************
  VOICE BAR (MIC REACTIVE)
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
    voiceLevel.style.width = `${Math.min(100, volume)}%`;
    requestAnimationFrame(animateVoice);
  }
  animateVoice();
});
