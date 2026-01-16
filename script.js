/***********************
  CONFIG
************************/
const OPENAI_API_KEY = "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"; // demo only

/***********************
  ELEMENTS
************************/
const timeEl = document.getElementById("time");
const textInput = document.getElementById("textInput");
const sendBtn = document.getElementById("sendBtn");
const voiceBar = document.getElementById("voiceBar");

/***********************
  TIME FUNCTION
************************/
function updateTime() {
  const now = new Date();
  timeEl.textContent = now.toLocaleTimeString("en-IN", { hour12: false });
}
setInterval(updateTime, 1000);
updateTime();

/***********************
  LOTTIE ANIMATION
************************/
const aiAnimation = lottie.loadAnimation({
  container: document.getElementById('aiAnimation'),
  renderer: 'svg',
  loop: true,
  autoplay: true,
  path: 'https://assets2.lottiefiles.com/packages/lf20_x62chJ.json' // Robot girl animation URL
});

/***********************
  SPEECH SYNTHESIS
************************/
function speak(text) {
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = "hi-IN";
  speechSynthesis.speak(utter);
}

/***********************
  CREATE VOICE DOTS
************************/
const DOT_COUNT = 20;
const dots = [];
for (let i = 0; i < DOT_COUNT; i++) {
  const dot = document.createElement('div');
  dot.classList.add('dot');
  voiceBar.appendChild(dot);
  dots.push(dot);
}

/***********************
  VOICE DOTS ANIMATION
************************/
navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
  const audioCtx = new AudioContext();
  const mic = audioCtx.createMediaStreamSource(stream);
  const analyser = audioCtx.createAnalyser();
  analyser.fftSize = 128;
  mic.connect(analyser);
  const dataArray = new Uint8Array(analyser.frequencyBinCount);

  function animateDots() {
    analyser.getByteFrequencyData(dataArray);
    dots.forEach((dot, i) => {
      const v = dataArray[i % dataArray.length] / 256; // 0-1
      dot.style.transform = `scaleY(${0.3 + v})`;
      dot.style.opacity = `${0.3 + v}`;
    });
    requestAnimationFrame(animateDots);
  }
  animateDots();
});

/***********************
  SEND BUTTON
************************/
sendBtn.addEventListener("click", async () => {
  const text = textInput.value.trim();
  if (!text) return;
  textInput.value = "";
  await handleUserMessage(text);
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
          { role: "system", content: "Tu ek close dost jaisa AI hai. Friendly, simple Hindi me jawab deta hai." },
          { role: "user", content: userText }
        ]
      })
    });

    const data = await res.json();
    const reply = data.choices[0].message.content;
    speak(reply);
  } catch (err) {
    console.error(err);
    speak("Bhai thoda network ya key issue lag raha hai.");
  }
}

/***********************
  AUTO GREETING
************************/
window.onload = () => {
  setTimeout(() => {
    speak("Hey dost, main ready hoon. Type karo aur baat karo!");
  }, 1200);
};
