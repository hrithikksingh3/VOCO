// gtts-proxy.js - tiny proxy to fetch Google Translate TTS and add CORS
// Usage: node gtts-proxy.js
const express = require('express');
const fetch = require('node-fetch'); // works with Node 14+. For Node 18+ you can use global fetch.
const cors = require('cors');

const app = express();
app.use(cors()); // allow all origins for local dev

app.get('/tts', async (req, res) => {
  try {
    const q = req.query.q || '';
    const tl = req.query.tl || 'en';
    if (!q) return res.status(400).send('Missing query parameter "q"');

    const url = 'https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob' +
                '&tl=' + encodeURIComponent(tl) +
                '&q=' + encodeURIComponent(q);

    const resp = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
      }
    });

    if (!resp.ok) return res.status(502).send('Upstream TTS failed: ' + resp.status);

    // stream audio back with proper content-type
    res.set('Content-Type', 'audio/mpeg');
    resp.body.pipe(res);
  } catch (err) {
    console.error('Proxy error', err);
    res.status(500).send('Proxy error');
  }
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`gTTS proxy running on http://localhost:${PORT}/tts`));
