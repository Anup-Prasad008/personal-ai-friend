<script>
  /***********************
    CONFIG
  ************************/
  const OPENAI_API_KEY = "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"; // Demo only - In production, secure this server-side

  /***********************
    ELEMENTS
  ************************/
  const timeEl = document.getElementById("time");
  const avatar = document.getElementById("aiLoopVideo");
  const voiceBar = document.querySelector(".voice-bar");
  const textDisplay = document.getElementById("textDisplay");
  const textInput = document.getElementById("textInput");
  const sendBtn = document.getElementById("sendBtn");

  /***********************
    TIME UPDATE (WITH SECONDS) - SMOOTH AND ACCURATE
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
    CURSOR FOLLOW (SMOOTH ANIMATION FOR AVATAR)
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
    avatarX += (mouseX - avatarX) * 0.05; // Smooth easing
    avatarY += (mouseY - avatarY) * 0.05;

    avatar.style.transform = `translate(${avatarX - window.innerWidth / 2}px, ${avatarY - window.innerHeight / 2}px)`;

    requestAnimationFrame(animateAvatar);
  }
  animateAvatar();

  /***********************
    SPEECH SYNTHESIS (ENGLISH VOICE FOR PROFESSIONAL TONE)
  ************************/
  function speak(text) {
    if ('speechSynthesis' in window) {
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = "en-US"; // English US for clear, professional voice
      utter.rate = 1; // Normal speed
      utter.pitch = 1; // Normal pitch
      utter.volume = 1; // Full volume

      utter.onstart = () => {
        voiceBar.classList.add("speaking");
      };

      utter.onend = () => {
        voiceBar.classList.remove("speaking");
      };

      speechSynthesis.speak(utter);
    } else {
      console.warn("Speech synthesis not supported.");
    }
  }

  /***********************
    DISPLAY TEXT (FOR TEXT INPUT RESPONSES)
  ************************/
  function displayText(text) {
    textDisplay.textContent = text;
    textDisplay.classList.add("show");
    setTimeout(() => {
      textDisplay.classList.remove("show");
    }, 5000); // Auto-hide after 5 seconds
  }

  /***********************
    AUTO GREETING ON LOAD
  ************************/
  window.addEventListener("load", () => {
    setTimeout(() => {
      speak("Hey friend, I'm ready. Say or type, I'm listening.");
    }, 1200);
  });

  /***********************
    SPEECH RECOGNITION (ALWAYS ACTIVE, CONTINUOUS)
  ************************/
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  if (SpeechRecognition) {
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US"; // Match voice language
    recognition.continuous = true; // Keep listening
    recognition.interimResults = false; // Only final results
    recognition.maxAlternatives = 1;

    recognition.start();

    recognition.onresult = (event) => {
      const transcript = event.results[event.results.length - 1][0].transcript;
      handleUserMessage(transcript, false); // false indicates voice input
    };

    recognition.onend = () => {
      recognition.start(); // Restart to keep always active
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      // Optionally, restart or notify user
    };
  } else {
    console.warn("Speech recognition not supported in this browser.");
  }

  /***********************
    TEXT INPUT HANDLING
  ************************/
  sendBtn.addEventListener("click", () => {
    const text = textInput.value.trim();
    if (!text) return;
    textInput.value = "";
    handleUserMessage(text, true); // true indicates text input
  });

  // Allow Enter key to send
  textInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      sendBtn.click();
    }
  });

  /***********************
    AI INTERACTION (OPENAI API)
  ************************/
  async function handleUserMessage(userText, isTextInput) {
    // Initial feedback
    if (!isTextInput) {
      speak("Hmm… thinking.");
    } else {
      displayText("Hmm… thinking.");
    }

    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
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
              content: "You are a close friend-like AI. Respond in friendly, simple English. Keep responses concise and engaging."
            },
            { role: "user", content: userText }
          ],
          max_tokens: 150, // Limit response length for efficiency
          temperature: 0.7 // Balanced creativity
        })
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      const reply = data.choices[0].message.content;

      // Respond based on input type
      if (isTextInput) {
        displayText(reply);
      } else {
        speak(reply);
      }

    } catch (error) {
      const errorMsg = "Sorry, there was an issue connecting. Please try again.";
      if (isTextInput) {
        displayText(errorMsg);
      } else {
        speak(errorMsg);
      }
      console.error("Error in AI interaction:", error);
    }
  }

  /***********************
    VOICE BAR (MIC REACTIVE DOTS - ENHANCED)
  ************************/
  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(stream => {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        const microphone = audioContext.createMediaStreamSource(stream);
        microphone.connect(analyser);

        const dataArray = new Uint8Array(analyser.frequencyBinCount);

        function animateVoiceDots() {
          analyser.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
          const scale = Math.min(2, 1 + average / 50); // Scale based on volume

          document.querySelectorAll('.dot').forEach(dot => {
            dot.style.transform = `scale(${scale})`;
          });

          requestAnimationFrame(animateVoiceDots);
        }
        animateVoiceDots();
      })
      .catch(err => {
        console.log("Microphone access denied or not available:", err);
      });
  } else {
    console.warn("getUserMedia not supported.");
  }

  /***********************
    ADDITIONAL RESPONSIVE HANDLING (IF NEEDED)
  ************************/
  // Window resize handling for dynamic adjustments (though CSS handles most)
  window.addEventListener("resize", () => {
    // Recalculate positions if necessary, but CSS clamp() handles scaling
  });
</script>
