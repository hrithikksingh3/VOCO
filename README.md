# **VOCO** 🔊✨

**VOCO (by Codersvoice)** is a free, modern **Text-to-Speech (TTS)** web app where you can **type/paste any text and instantly listen to it** — no API keys, no signup, no cost.

It runs directly in the browser using **meSpeak.js** and adds extra power features like **history saving**, **export/import**, **shareable links**, **theme toggle**, and **audio download**.

> ✅ Works great for: content creators, students, voiceovers, pronunciation practice, accessibility, quick narration.

---

## **Live Demo**

🔗 **Check out the live version**: [VOCO](https://voco.onrender.com)  

---

## **Features** ✅

✅ **Instant Text-to-Speech** (type/paste → Speak)
✅ **Multiple Voices / Languages** *(browser-dependent)*
✅ **Voice Controls**: Rate & Pitch sliders
✅ **Stop button** to instantly stop speech
✅ **History (Local Storage)** — saved phrases persist in your browser
✅ **Save / Clear History** controls
✅ **Share**: Generate shareable link via query string
✅ **Export / Import History** (JSON)
✅ **Theme Toggle**: Light / Dark
✅ **Keyboard Shortcut**: `Ctrl/⌘ + Enter` to speak
✅ **Phonetics + Syllable split** (approx rendering)
✅ **Download MP3** *(limit: max ~200 words)*

---

## **Tech Stack** 🛠️

### **Frontend**

* 🌐 HTML5
* 🎨 CSS3
* ⚡ JavaScript
* 🗣️ **meSpeak.js** (offline speech engine)
* 🎧 **lamejs** (MP3 encoding)

### **Backend (optional but included)**

* 🟢 Node.js
* 🔁 `gtts-proxy.js` (proxy service for online voice features / deployment compatibility)

---

## **Project Structure** 📂

```
VOCO/
│
├── index.html          # Main UI
├── voco1.css           # Styles
├── voco1.js            # App logic
├── gtts-proxy.js       # Node proxy for Render deployment
├── package.json        # Start script + deps
├── .gitignore
└── README.md
```

---

## **How to Run Locally** 🚀

### ✅ Option 1: Run Frontend Only (basic)

If you only want browser TTS (meSpeak), simply open the file:

```bash
index.html
```

> ⚠️ Some browsers block certain features (like share/copy) if not served via localhost.

---

### ✅ Option 2: Run with Node Proxy (recommended)

This is the best way (same behavior as deployment).

#### 1️⃣ Install dependencies

```bash
npm install
```

#### 2️⃣ Start server

```bash
npm start
```

Now open:

```
http://localhost:3000
```

---

## **Deployment on Render** 🌍

VOCO can be deployed easily on **Render** as a **Web Service** (because this repo includes `gtts-proxy.js`).

### ✅ Steps

1. Push repo to GitHub
2. Go to Render Dashboard → **New +** → **Web Service**
3. Select repo: `hrithikksingh3/VOCO`

### Render Settings

* **Environment:** Node
* **Build Command:**

  ```bash
  npm install
  ```
* **Start Command:**

  ```bash
  npm start
  ```

✅ Render will automatically detect and assign a port via `process.env.PORT` (ensure proxy uses it).

---

## **Usage Guide** 🧠

1. Type or paste text into the editor
2. Select voice
3. Adjust **Rate / Pitch**
4. Click **🔊 Speak**
5. Use:

   * **💾 Save** → stores in history
   * **🔗 Share** → shareable link
   * **⬇ Download** → MP3 download
   * **⬇ Export / ⬆ Import** → JSON history backup

---

## **Extras Included** 🎁

* Multiple voices & languages *(browser-dependent)*
* Syllables split + approximate phonetics
* Share via short URL (query string encoding)
* Export / import saved history
* MP3 downloads *(max 200 words)*

---

## **Author** 👨‍💻

**Hrithik Kumar Singh**
*Software Developer*

📫 **Connect with me:**

* 💼 [LinkedIn](https://www.linkedin.com/in/hrithikksingh/)
* 🐙 [GitHub](https://github.com/hrithikksingh3)

---

## **Contact** 📩

For any questions or feedback, reach out at:
📧 **[shrithik511@gmail.com](mailto:shrithik511@gmail.com)**

---

## **Support** ☕❤️

<h2>I love coffee. Wanna buy me one? 😊👇</h2>
<p align="center">
  <a href="https://www.buymeacoffee.com/codersvoice" target="_blank">
    <img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me a Coffee" style="height: 60px !important;width: 217px !important;" >
  </a>
</p>
