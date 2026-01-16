const OPENAI_API_KEY = "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"; // demo only

const statusDot = document.getElementById("sidebar").firstElementChild;
const timeEl = document.getElementById("time");
const weatherEl = document.getElementById("weather");

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

/* ---------- VOICE ---------- */
const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
recognition.lang = "hi-IN";

function speak(text) {
  statusDot.className = "status-dot speaking";
  const msg = new SpeechSynthesisUtterance(text);
  msg.lang = "hi-IN";
  msg.onend = () => statusDot.className = "status-dot";
  speechSynthesis.speak(msg);
}

/* ---------- GREETING ---------- */
window.onload = () => {
  setTimeout(() => {
    speak("Hey bhai, main yahin hoon. Jab bolega, main sununga.");
  }, 1000);
};

/* ---------- LISTEN ---------- */
document.body.addEventListener("click", () => {
  statusDot.className = "status-dot listening";
  recognition.start();
});

recognition.onresult = async (e) => {
  const userText = e.results[0][0].transcript;

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "Tu ek close dost jaisa AI hai." },
        { role: "user", content: userText }
      ]
    })
  });

  const data = await res.json();
  speak(data.choices[0].message.content);
};
