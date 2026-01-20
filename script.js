/***********************
    CONFIG
  ************************/
  const OPENAI_API_KEY = "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"; // Demo only - In production, secure this server-side

/*********************************
 ELEMENTS
**********************************/
const timeEl = document.getElementById("time");
const avatar = document.getElementById("aiLoopVideo");
const voiceBar = document.querySelector(".voice-bar");
const dots = document.querySelectorAll(".dot");
const textDisplay = document.getElementById("textDisplay");
const textInput = document.getElementById("textInput");
const sendBtn = document.getElementById("sendBtn");

/*********************************
 LIVE CLOCK
**********************************/
function updateTime() {
  const now = new Date();
  timeEl.textContent = now.toLocaleTimeString();
}
setInterval(updateTime, 1000);
updateTime();

/*********************************
 SMOOTH CURSOR FOLLOW (AVATAR)
**********************************/
let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;
let currentX = mouseX;
let currentY = mouseY;

document.addEventListener("mousemove", e => {
  mouseX = e.clientX;
  mouseY = e.clientY;
});

function animateAvatar() {
  currentX += (mouseX - currentX) * 0.04;
  currentY += (mouseY - currentY) * 0.04;

  avatar.style.transform = `
    translate(${currentX - window.innerWidth / 2}px,
              ${currentY - window.innerHeight / 2}px)
  `;

  requestAnimationFrame(animateAvatar);
}
animateAvatar();

/*********************************
 SPEECH SYNTHESIS
**********************************/
function speak(text) {
  if (!window.speechSynthesis) return;

  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = "en-US";
  utter.rate = 1;
  utter.pitch = 1;

  utter.onstart = () => voiceBar.classList.add("speaking");
  utter.onend = () => voiceBar.classList.remove("speaking");

  speechSynthesis.cancel();
  speechSynthesis.speak(utter);
}

/*********************************
 TEXT DISPLAY
**********************************/
function showText(text) {
  textDisplay.textContent = text;
  textDisplay.classList.add("show");

  setTimeout(() => {
    textDisplay.classList.remove("show");
  }, 5000);
}

/*********************************
 GREETING
**********************************/
window.addEventListener("load", () => {
  setTimeout(() => {
    speak("Hey! I'm Bunny. You can speak or type. I'm listening.");
  }, 1200);
});

/*********************************
 SPEECH RECOGNITION (CONTINUOUS)
**********************************/
const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

if (SpeechRecognition) {
  const recognition = new SpeechRecognition();
  recognition.lang = "en-US";
  recognition.continuous = true;

  recognition.start();

  recognition.onresult = e => {
    const text = e.results[e.results.length - 1][0].transcript;
    handleUserMessage(text, false);
  };

  recognition.onend = () => recognition.start();
}

/*********************************
 TEXT INPUT
**********************************/
sendBtn.addEventListener("click", sendText);
textInput.addEventListener("keydown", e => {
  if (e.key === "Enter") sendText();
});

function sendText() {
  const text = textInput.value.trim();
  if (!text) return;
  textInput.value = "";
  handleUserMessage(text, true);
}

/*********************************
 OPENAI CHAT (through backend)
**********************************/
async function handleUserMessage(userText, isText) {
  isText ? showText("Thinking…") : speak("Thinking");

  try {
    const res = await fetch("http://localhost:3000/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [
          { role: "system", content: "You are Bunny, a friendly AI companion. Keep replies short, warm, and human-like." },
          { role: "user", content: userText }
        ]
      })
    });

    const data = await res.json();
    const reply = data.choices[0].message.content;

    isText ? showText(reply) : speak(reply);

  } catch (err) {
    const msg = "Connection issue. Please try again.";
    isText ? showText(msg) : speak(msg);
    console.error(err);
  }
}

/*********************************
 MIC REACTIVE DOTS
**********************************/
if (navigator.mediaDevices?.getUserMedia) {
  navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
    const audioCtx = new AudioContext();
    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 256;

    const mic = audioCtx.createMediaStreamSource(stream);
    mic.connect(analyser);

    const data = new Uint8Array(analyser.frequencyBinCount);

    function animateDots() {
      analyser.getByteFrequencyData(data);
      const avg = data.reduce((a, b) => a + b) / data.length;
      const scale = Math.min(2, 1 + avg / 60);

      dots.forEach(dot => {
        dot.style.transform = `scale(${scale})`;
      });

      requestAnimationFrame(animateDots);
    }
    animateDots();
  });
}
