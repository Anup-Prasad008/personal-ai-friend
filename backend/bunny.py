from flask import Flask, request, jsonify, render_template_string
import time
import datetime
import random
import webbrowser
import sys
import math
import ast
import operator
import os
import json
from openai import OpenAI

app = Flask(__name__)

# ---------------- API KEY LOADER ----------------

def load_api_key():
    try:
        with open("key.txt", "r") as f:
            key = f.read().strip()
            if not key:
                return None
            return key
    except FileNotFoundError:
        return None

API_KEY = load_api_key()
if API_KEY is None:
    print("API key not found. Exiting.")
    sys.exit(1)

client = OpenAI(api_key=API_KEY)

HISTORY_FILE = "chat_history.json"
MEMORY_FILE = "memory.json"

# Load memory and initialize messages (global for simplicity)
messages = []
def load_memory_and_init():
    global messages
    system_prompt = """
    You are Bunny, a friendly and helpful AI chatbot created by Anup Prasad.
    Respond in a warm, engaging, and fun way, like a best friend.
    Understand and reply in the user's language (e.g., if they speak Hindi, respond in Hindi; if English, in English).
    Keep replies concise but natural. If the user asks something specific, answer accurately, but always add a friendly touch.
    Be empathetic, fun, and supportive in all interactions.
    Avoid repeating generic questions like "how are you" unless directly asked. Respond based on the user's input.
    """
    memory = ""
    if os.path.exists(MEMORY_FILE):
        try:
            with open(MEMORY_FILE, 'r') as f:
                memory_data = json.load(f)
                memory = memory_data.get("summary", "")
        except json.JSONDecodeError:
            memory = ""
    if memory:
        system_prompt += f"\n\nImportant memory from previous conversations: {memory}"
    messages = [{"role": "system", "content": system_prompt}]

load_memory_and_init()

def save_history(messages):
    try:
        with open(HISTORY_FILE, 'w') as f:
            json.dump(messages, f)
    except Exception as e:
        print(f"Error saving history: {e}")

def save_memory(summary):
    try:
        with open(MEMORY_FILE, 'w') as f:
            json.dump({"summary": summary}, f)
    except Exception as e:
        print(f"Error saving memory: {e}")

def generate_summary(messages):
    user_messages = [msg for msg in messages if msg["role"] == "user"]
    if len(user_messages) <= 2:
        return ""
    convo_messages = [msg for msg in messages if msg["role"] != "system"]
    summary_prompt = "Summarize the key points, topics discussed, user preferences, and any important information from this conversation in 2-3 sentences. Focus on what Bunny should remember for future interactions."
    convo_messages.append({"role": "user", "content": summary_prompt})
    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=convo_messages,
            temperature=0.5,
            max_tokens=200,
            presence_penalty=0.0,
            frequency_penalty=0.0
        )
        return response.choices[0].message.content
    except Exception as e:
        return ""

def ask_ai(question, messages):
    messages.append({"role": "user", "content": question})
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=messages,
        temperature=1.0,
        top_p=1.0,
        max_tokens=5000,
        presence_penalty=0.6,
        frequency_penalty=0.0
    )
    answer = response.choices[0].message.content
    messages.append({"role": "assistant", "content": answer})
    save_history(messages)
    return answer

def show_time():
    now = datetime.datetime.now()
    return f"Current time is {now.strftime('%Y-%m-%d %H:%M:%S')} (Local time)"

def greet_by_time():
    hour = datetime.datetime.now().hour
    if 5 <= hour < 12:
        return "Good morning! Hope your day starts great!"
    elif 12 <= hour < 17:
        return "Good afternoon! How's your day going?"
    elif 17 <= hour < 21:
        return "Good evening! Hope you had a productive day!"
    else:
        return "Good night! Working late, huh? Take care!"

def arithmetic_many(user_input):
    parts = user_input.split()
    if len(parts) < 3:
        return "Please enter operation followed by at least two numbers (e.g. 'sum 1 2 3')."
    cmd = parts[0]
    try:
        nums = [float(x) for x in parts[1:]]
    except ValueError:
        return "Couldn't parse numbers. Make sure to enter numeric values."
    result = nums[0]
    for n in nums[1:]:
        if cmd in ("sum", "add", "jod"):
            result += n
        elif cmd in ("sub", "subtract", "ghata"):
            result -= n
        elif cmd in ("mul", "multiply", "guna"):
            result *= n
        elif cmd in ("div", "divide", "bhag"):
            if n == 0:
                return "Division by zero!"
            result /= n
        else:
            return "Unknown command. Use sum/add/sub/mul/div."
    return f"Result = {result:.2f}"

_allowed_operators = {
    ast.Add: operator.add,
    ast.Sub: operator.sub,
    ast.Mult: operator.mul,
    ast.Div: operator.truediv,
    ast.Pow: operator.pow,
    ast.USub: operator.neg,
    ast.UAdd: operator.pos,
    ast.Mod: operator.mod,
}

def _eval_ast(node):
    if isinstance(node, ast.Num):
        return node.n
    elif isinstance(node, ast.BinOp):
        left = _eval_ast(node.left)
        right = _eval_ast(node.right)
        op_type = type(node.op)
        if op_type in _allowed_operators:
            try:
                return _allowed_operators[op_type](left, right)
            except ZeroDivisionError:
                raise ZeroDivisionError
        else:
            raise ValueError("Unsupported operator")
    elif isinstance(node, ast.UnaryOp):
        operand = _eval_ast(node.operand)
        op_type = type(node.op)
        if op_type in _allowed_operators:
            return _allowed_operators[op_type](operand)
        else:
            raise ValueError("Unsupported unary operator")
    elif isinstance(node, ast.Expression):
        return _eval_ast(node.body)
    else:
        raise ValueError("Unsupported expression")

def evaluate_bodmas(expr_str):
    expr = expr_str.strip()
    try:
        parsed = ast.parse(expr, mode='eval')
        result = _eval_ast(parsed)
        return f"Result = {float(result):.2f}"
    except ZeroDivisionError:
        return "Division by zero!"
    except Exception:
        return "Could not evaluate expression. Only arithmetic allowed."

def number_system_conversion():
    return "Number system conversion menu: 1. Binary to Decimal/Octal/Hexa, etc. (Use console for full interaction)"

def open_url(url):
    try:
        webbrowser.open_new_tab(url)
        return f"Opening {url}..."
    except Exception as e:
        return f"Couldn't open browser: {e}"

# HTML Template (Embedded for Simplicity)
HTML_TEMPLATE = """
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Bunny AI 🐰</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Poppins', sans-serif; }
    body { background: radial-gradient(circle at top, #141b2d, #080b14); height: 100vh; display: flex; flex-direction: column; color: #fff; overflow: hidden; }
    .center-area { flex: 1; display: flex; align-items: center; justify-content: center; position: relative; }
    .orbit { width: 180px; height: 180px; border-radius: 50%; border: 2px dashed rgba(255, 208, 0, 0.3); animation: rotate 6s linear infinite; position: absolute; }
    .bunny-core { width: 90px; height: 90px; background: #ffd000; border-radius: 50%; box-shadow: 0 0 40px #ffd000; animation: pulse 2s ease-in-out infinite; }
    @keyframes rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
    @keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.12); } }
    .chat-area { background: rgba(0,0,0,0.6); backdrop-filter: blur(12px); border-top: 1px solid rgba(255,255,255,0.1); padding: 12px; display: flex; gap: 10px; }
    .chat-area input { flex: 1; padding: 14px; border-radius: 10px; border: none; outline: none; font-size: 15px; }
    .chat-area button { padding: 14px 22px; border-radius: 10px; border: none; background: #ffd000; color: #000; font-weight: 600; cursor: pointer; transition: 0.3s; }
    .chat-area button:hover { background: #ffea70; }
    .chat-log { position: absolute; bottom: 70px; left: 50%; transform: translateX(-50%); width: 92%; max-height: 200px; overflow-y: auto; padding: 10px; }
    .msg { margin-bottom: 8px; font-size: 14px; }
    .user { color: #ffd000; }
    .bunny { color: #7dd3ff; }
  </style>
</head>
<body>
  <div class="chat-log" id="chatLog"></div>
  <div class="center-area">
    <div class="orbit"></div>
    <div class="bunny-core"></div>
  </div>
  <div class="chat-area">
    <input type="text" id="userInput" placeholder="Bunny se kuch bolo..." />
    <button onclick="sendMessage()">Send</button>
  </div>
  <script>
    const chatLog = document.getElementById('chatLog');
    const userInput = document.getElementById('userInput');
    function addMessage(sender, text, className) {
      const msg = document.createElement('div');
      msg.className = `msg ${className}`;
      msg.innerHTML = `<strong>${sender}:</strong> ${text}`;
      chatLog.appendChild(msg);
      chatLog.scrollTop = chatLog.scrollHeight;
    }
    async function sendMessage() {
      const message = userInput.value.trim();
      if (!message) return;
      addMessage('You', message, 'user');
      userInput.value = '';
      try {
        const response = await fetch('/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: message })
        });
        const data = await response.json();
        addMessage('Bunny', data.response, 'bunny');
      } catch (error) {
        addMessage('Bunny', 'Sorry, something went wrong!', 'bunny');
      }
    }
    userInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') sendMessage();
    });
    addMessage('Bunny', "Hey! I'm Bunny - your AI Assistant. Type something to chat!", 'bunny');
  </script>
</body>
</html>
"""

@app.route('/')
def index():
    return render_template_string(HTML_TEMPLATE)

@app.route('/chat', methods=['POST'])
def chat():
    data = request.get_json()
    user_input = data.get('message', '').strip()
    if not user_input:
        return jsonify({'response': 'Please type something!'})

    lower = user_input.lower()

    if lower == "time" or lower == "date" or lower == "samay" or lower == "tarikh":
        response = show_time()
    elif lower == "convert" or lower == "number system" or lower == "convert karo":
        response = number_system_conversion()
    elif any(lower.startswith(k) for k in ["sum ", "add ", "sub ", "subtract ", "mul ", "multiply ", "div ", "divide ", "jod ", "ghata ", "guna ", "bhag "]):
        response = arithmetic_many(lower)
    elif any(ch in lower for ch in "+-*/()"):
        expr_chars = set("0123456789.+-*/() ")
        if all((c in expr_chars) for c in lower):
            response = evaluate_bodmas(lower)
        else:
            response = ask_ai(user_input, messages)
    elif lower.startswith("lyrics") or lower.startswith("gaana lyrics") or lower.startswith("song lyrics"):
        song = user_input[6:].strip() if lower.startswith("lyrics") else user_input[12:].strip() if lower.startswith("gaana lyrics") else user_input[11:].strip()
        question = f"Provide the lyrics for the song '{song}'. If possible, include the artist or source."
        response = ask_ai(question, messages)
    elif lower.startswith("weather") or lower.startswith("mausam"):
        location = user_input[7:].strip() if lower.startswith("weather") else user_input[6:].strip()
        url = f"https://www.google.com/search?q=weather+in+{location.replace(' ', '+')}"
        response = f"Fetching weather for {location}..." + open_url(url)
    elif lower == "open google" or lower == "google kholo":
        response = "Opening Google..." + open_url("https://www.google.com")
    elif lower == "open youtube" or lower == "youtube kholo":
        response = "Opening YouTube..." + open_url("https://www.youtube.com")
    elif lower.startswith("play music") or lower.startswith("song") or lower.startswith("music") or lower.startswith("gaana"):
        response = "Music time! Opening YouTube..." + open_url("https://youtu.be/h7rpAUGwQ0g?si=Xa-k46q8b8og_A-F")
    elif lower == "open instagram" or lower == "instagram kholo":
        response = "Opening Instagram..." + open_url("https://www.instagram.com")
    elif lower == "open snapchat" or lower == "snapchat kholo":
        response = "Opening Snapchat..." + open_url("https://www.snapchat.com")
    elif lower == "open facebook" or lower == "facebook kholo":
        response = "Opening Facebook..." + open_url("https://www.facebook.com")
    elif lower == "open whatsapp" or lower == "whatsapp kholo":
        response = "Opening WhatsApp Web..." + open_url("https://web.whatsapp.com")
    else:
        response = ask_ai(user_input, messages)

    return jsonify({'response': response})

if __name__ == "__main__":
    app.run(debug=True)
