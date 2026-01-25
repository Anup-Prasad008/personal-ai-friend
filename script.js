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
// script.js - Complete JavaScript for PrintEase Website

// Smooth scrolling for navigation links
document.querySelectorAll('header nav a').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const targetId = this.getAttribute('href').substring(1);
        const targetSection = document.getElementById(targetId);
        if (targetSection) {
            targetSection.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
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
// Form validation and submission handler
document.getElementById('contactForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Get form values
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const message = document.getElementById('message').value.trim();
    
    // Basic validation
    if (!name || !email || !message) {
        alert('Please fill in all fields.');
        return;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        alert('Please enter a valid email address.');
        return;
    }
    
    // Simulate form submission (replace with actual backend integration)
    console.log('Form submitted:', { name, email, message });
    alert('Thank you for your message! We will get back to you soon.');
    
    // Reset form
    this.reset();
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
// Simple price calculator for printing services (demo)
function calculatePrice() {
    const bwPages = parseInt(document.getElementById('bwPages').value) || 0;
    const colorPages = parseInt(document.getElementById('colorPages').value) || 0;
    const plan = document.getElementById('plan').value;
    
    let bwRate, colorRate;
    if (plan === 'basic') {
        bwRate = 0.10;
        colorRate = 0.50;
    } else if (plan === 'premium') {
        bwRate = 0.08;
        colorRate = 0.40;
    } else {
        alert('Select a plan for calculation.');
        return;
    }
    
    const total = (bwPages * bwRate) + (colorPages * colorRate);
    document.getElementById('totalPrice').textContent = `Total: $${total.toFixed(2)}`;
}

/*********************************
 TEXT INPUT
**********************************/
sendBtn.addEventListener("click", sendText);
textInput.addEventListener("keydown", e => {
  if (e.key === "Enter") sendText();
// Add event listeners for price calculator (assuming we add HTML elements for it)
document.addEventListener('DOMContentLoaded', function() {
    // If you add a calculator section, uncomment and adjust
    // const calculateBtn = document.getElementById('calculateBtn');
    // if (calculateBtn) {
    //     calculateBtn.addEventListener('click', calculatePrice);
    // }
    
    // Add any other initialization here
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
// Service selection interactivity (highlight on click)
document.querySelectorAll('.service').forEach(service => {
    service.addEventListener('click', function() {
        // Remove highlight from others
        document.querySelectorAll('.service').forEach(s => s.classList.remove('selected'));
        // Add highlight to clicked
        this.classList.add('selected');
});
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
// Add CSS for selected service (you can add this to style.css)
const style = document.createElement('style');
style.textContent = `
    .service.selected {
        border: 2px solid #3498db;
        background: #e8f4fd;
    }
`;
document.head.appendChild(style);

      dots.forEach(dot => {
        dot.style.transform = `scale(${scale})`;
      });
// Optional: Lazy load images or other performance enhancements
// (For now, placeholder image is used; replace with actual images)

      requestAnimationFrame(animateDots);
    }
    animateDots();
  });
}
// Error handling for missing elements
window.addEventListener('error', function(e) {
    console.error('JavaScript error:', e.message);
});
