// voco1.js — full file (Option A: keep voice dropdown for playback; downloads use Google TTS MP3)

/* Single-file free TTS web app (browser SpeechSynthesis for playback; Google Translate TTS for downloads) */

// small helper to fetch element by id
const $ = id => document.getElementById(id);

// DOM elements (keeps original IDs you used)
const txt = $('txt');
const voicesEl = $('voices');
const rate = $('rate');
const pitch = $('pitch');
const rateVal = $('rateVal');
const pitchVal = $('pitchVal');
const speakBtn = $('speak');
const stopBtn = $('stop');
const downloadBtn = $('downloadAudio');
const saveBtn = $('save');
const historyEl = $('history');
const phoneticEl = $('phonetic');
const syllEl = $('syll');
const shareBtn = $('share');
const exportBtn = $('export');
const importBtn = $('import');
const importFile = $('importfile');
const clearBtn = $('clear');
const themeLight = $('themeLight');
const themeDark = $('themeDark');
const copyModal = $('copyModal');
const modalInput = $('modalInput');
const modalCopy = $('modalCopy');
const modalClose = $('modalClose');

let voices = [];
let HISTORY_KEY = 'pronounce_history_v1';
let meSpeakReady = false;

/* ---------------- init meSpeak (kept but optional) ----------------
   We keep meSpeak init for backward compatibility if you later add local mespeak files.
   Downloads will use Google TTS (Option A), so meSpeak blocking won't stop download.
*/
function initMeSpeak(retries = 6, delay = 500) {
  try {
    if (typeof meSpeak === 'undefined') {
      console.warn(`initMeSpeak: meSpeak not found. retries left: ${retries}`);
      if (retries > 0) return setTimeout(() => initMeSpeak(retries - 1, delay), delay);
      return console.error('initMeSpeak: mespeak script never loaded. Add <script src=".../mespeak.min.js"> before voco1.js if you want mespeak features.');
    }

    console.log('initMeSpeak: meSpeak present — loading config & voice...');
    meSpeak.loadConfig('https://cdn.jsdelivr.net/gh/robertgit/meSpeak/mespeak_config.json');

    meSpeak.loadVoice(
      'https://cdn.jsdelivr.net/gh/robertgit/meSpeak/voices/en/en-us.json',
      () => {
        meSpeakReady = true;
        console.log('initMeSpeak: voice loaded — meSpeakReady = true');
      },
      (err) => {
        console.warn('initMeSpeak: voice load failed:', err);
        setTimeout(() => {
          if (typeof meSpeak.generateWAV === 'function') {
            meSpeakReady = true;
            console.log('initMeSpeak: meSpeak.generateWAV present — enabling TTS despite voice fetch error.');
          } else {
            console.warn('initMeSpeak: generateWAV not available; meSpeak features disabled.');
          }
        }, 200);
      }
    );
  } catch (e) {
    console.error('initMeSpeak: unexpected error', e);
    if (retries > 0) setTimeout(() => initMeSpeak(retries - 1, delay), delay);
  }
}
setTimeout(() => initMeSpeak(), 200);

/* ---------------- helpers (kept) ---------------- */

function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

/* ---------------- history / UI / utilities (kept intact from original) ---------------- */

function readHistory() {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.warn('Failed to parse history, resetting to empty array', e);
    return [];
  }
}

function writeHistory(arr) {
  try {
    if (!Array.isArray(arr)) arr = [];
    localStorage.setItem(HISTORY_KEY, JSON.stringify(arr));
  } catch (e) { console.error('Failed to write history', e); }
}

function loadVoices() {
  try {
    voices = (speechSynthesis.getVoices() || []).sort((a, b) => (a.lang || '').localeCompare(b.lang || ''));
  } catch (e) { voices = []; }
  if (voicesEl) {
    voicesEl.innerHTML = '';
    const opt = document.createElement('option'); opt.value = ''; opt.textContent = 'Default (browser)'; voicesEl.appendChild(opt);
    voices.forEach(v => {
      const o = document.createElement('option'); o.value = v.name; o.textContent = v.name + ' — ' + v.lang; voicesEl.appendChild(o);
    });
  }
}

if ('speechSynthesis' in window) {
  speechSynthesis.onvoiceschanged = loadVoices;
  setTimeout(loadVoices, 50);
} else if (voicesEl) {
  voicesEl.style.display = 'none';
}

function speak(textToSpeak) {
  if (!textToSpeak) return;
  if (!('speechSynthesis' in window)) return alert("This browser doesn't support SpeechSynthesis.");
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(textToSpeak);
  u.rate = parseFloat(rate.value || 1);
  u.pitch = parseFloat(pitch.value || 1);
  const selected = voicesEl && voicesEl.value;
  if (selected) {
    const v = voices.find(x => x.name === selected);
    if (v) u.voice = v;
  }
  u.onstart = () => { if (speakBtn) speakBtn.textContent = '🔊 Playing...'; }
  u.onend = () => { if (speakBtn) speakBtn.textContent = '🔊 Speak'; }
  speechSynthesis.speak(u);
}

function getApproxPhonetic(s) {
  const map = { 'th': 'θ', 'sh': 'ʃ', 'ch': 'tʃ', 'ng': 'ŋ', 'ee': 'iː', 'oo': 'uː', 'ou': 'aʊ' };
  let out = s.toLowerCase();
  Object.keys(map).forEach(k => { out = out.replaceAll(k, map[k]); });
  out = out.replace(/[^a-z0-9\sːθʃtʃngaʊ]/g, '');
  return out.slice(0, 200) || '—';
}

function splitSyllables(text) {
  const words = text.trim().split(/\s+/).filter(Boolean);
  const result = words.map(w => {
    let parts = w.split(/(?=[AEIOUYaeiouyÁÉÍÓÚÀÈÌÒÙĀĒĪŌŪ])/);
    if (parts.length === 1) {
      if (w.length > 6) return w.slice(0, Math.ceil(w.length / 2)) + '-' + w.slice(Math.ceil(w.length / 2));
      return w;
    }
    return parts.join('-');
  });
  return result.join(' ');
}

function saveToHistory(text) {
  if (!text || !text.trim()) return;
  const arr = readHistory();
  arr.unshift({ text, ts: Date.now() });
  const uniq = arr.filter((v, i, a) => a.findIndex(x => x.text === v.text) === i).slice(0, 50);
  writeHistory(uniq);
  renderHistory();
}

function renderHistory() {
  const arr = readHistory();
  if (!historyEl) return;
  historyEl.innerHTML = '';
  arr.forEach((h, idx) => {
    const li = document.createElement('li'); li.className = 'item';
    const span = document.createElement('div'); span.className = 'phrase'; span.title = h.text; span.textContent = h.text;
    const right = document.createElement('div');
    const play = document.createElement('button'); play.className = 'small-btn'; play.textContent = '▶'; play.onclick = () => { if (txt) txt.value = h.text; updateMeta(); speak(h.text); }
    const del = document.createElement('button'); del.className = 'small-btn'; del.textContent = '✖'; del.onclick = () => {
      const current = readHistory();
      current.splice(idx, 1);
      writeHistory(current);
      renderHistory();
    }
    right.appendChild(play); right.appendChild(del);
    li.appendChild(span); li.appendChild(right);
    historyEl.appendChild(li);
  });
}

function updateMeta() {
  const t = (txt && txt.value) ? txt.value : '';
  if (phoneticEl) phoneticEl.textContent = getApproxPhonetic(t);
  if (syllEl) syllEl.textContent = splitSyllables(t);
}

/* ---------------- events and handlers ---------------- */

// Speak / stop handlers
if (speakBtn) speakBtn.onclick = () => { const t = (txt && txt.value) ? txt.value : ''; updateMeta(); speak(t); }
if (stopBtn) stopBtn.onclick = () => { if ('speechSynthesis' in window) speechSynthesis.cancel(); }

/* ---------------- DOWNLOAD handler (Option A) ----------------
   - Downloads MP3 from Google Translate TTS endpoint
   - Playback still uses browser SpeechSynthesis + voice dropdown
   - Download language is derived from selected voice's lang when possible; default 'en'
   - Simple and reliable; no mespeak/lamejs required for downloads
*/

// FINAL DOWNLOAD HANDLER (Option A + Local Google TTS Proxy)
// DEBUGGED download handler — paste this in place of your old one
if (downloadBtn) {
  downloadBtn.onclick = async () => {
    // read textarea live from DOM (avoid stale references)
    const ta = document.querySelector('#txt');
    console.log('[download] textarea element ->', ta);
    const rawText = ta ? ta.value : undefined;
    console.log('[download] rawText =>', rawText);

    const text = rawText !== undefined && rawText !== null ? String(rawText).trim() : '';
    console.log('[download] trimmed text =>', JSON.stringify(text));

    if (!text) {
      // super explicit message so we don't get "Missing q" again
      alert('No text detected in the input. Please type something before clicking Download.');
      return;
    }

    // derive language (best-effort)
    let lang = 'en';
    try {
      const selected = (document.querySelector('#voices') && document.querySelector('#voices').value) || '';
      if (selected) {
        const v = (voices || []).find(x => x.name === selected);
        if (v && v.lang) lang = v.lang.split(/[-_]/)[0] || 'en';
      }
    } catch (e) {
      console.warn('[download] could not resolve voice lang, defaulting to en', e);
    }

 // robust proxy selection + correct /tts path (paste this into voco1.js)
const LOCAL_PROXY = 'http://localhost:5001/tts';
const PROD_PROXY = 'https://gtts-proxy.onrender.com/tts'; // use your Render URL + /tts

// treat localhost, 127.0.0.1 and empty (file:// dev) as local
const isLocalHost = ['localhost', '127.0.0.1'].includes(location.hostname) || location.hostname === '';
const proxyBase = isLocalHost ? LOCAL_PROXY : PROD_PROXY;

// build final URL for the current text/lang
const proxyUrl = `${proxyBase}?q=${encodeURIComponent(text)}&tl=${encodeURIComponent(lang)}`;

// debug log (remove after verifying)
console.log('[download] hostname=', location.hostname, 'isLocalHost=', isLocalHost);
console.log('[download] proxyBase=', proxyBase);
console.log('[download] proxyUrl=', proxyUrl);


    // basic UI lock
    downloadBtn.disabled = true;
    const origText = downloadBtn.textContent;
    downloadBtn.textContent = 'Downloading...';

    try {
      const resp = await fetch(proxyUrl, { method: 'GET' });
      console.log('[download] proxy response status', resp.status, resp.statusText);
      if (!resp.ok) {
        const body = await resp.text().catch(()=>null);
        console.error('[download] proxy returned error body:', body);
        alert('Download failed: proxy returned an error. Check proxy terminal and browser console.');
        return;
      }
      const blob = await resp.blob();
      console.log('[download] received blob, size bytes =', blob.size);
      if (!blob || blob.size === 0) {
        alert('Downloaded file is empty. Check proxy logs.');
        return;
      }
      // trigger download
      const filename = 'vocal.mp3';
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = filename; document.body.appendChild(a); a.click(); a.remove();
      setTimeout(()=>URL.revokeObjectURL(url), 2000);
      console.log('[download] saved', filename);
    } catch (err) {
      console.error('[download] fetch error', err);
      alert('Failed to download audio. Is the proxy running? See console for details.');
    } finally {
      downloadBtn.disabled = false;
      downloadBtn.textContent = origText;
    }
  };
}



/* clipboard/modal/share handlers kept as original logic */
if (saveBtn) saveBtn.onclick = () => { saveToHistory(txt.value); }
if (clearBtn) clearBtn.onclick = () => { writeHistory([]); renderHistory(); }
if (rate) rate.oninput = () => { if (rateVal) rateVal.textContent = rate.value; }
if (pitch) pitch.oninput = () => { if (pitchVal) pitchVal.textContent = pitch.value }

// Share button: robust clipboard fallback
if (shareBtn) shareBtn.onclick = async () => {
  const t = encodeURIComponent(txt.value || '');
  const url = new URL(location.href);
  url.searchParams.set('q', t);
  const shareUrl = url.toString();

  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(shareUrl);
      return alert('Share link copied to clipboard!');
    }
    throw new Error('Clipboard API not available');
  } catch (err) {
    try {
      const ta = document.createElement('textarea');
      ta.value = shareUrl;
      ta.style.position = 'fixed'; ta.style.left = '-9999px'; ta.style.top = '0';
      document.body.appendChild(ta);
      ta.focus(); ta.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(ta);
      if (ok) return alert('Share link copied to clipboard (fallback)!');
    } catch (e) { /* fall through */ }

    modalInput.value = shareUrl;
    copyModal.style.display = 'flex';
    setTimeout(() => { modalInput.select(); }, 30);
  }
}

// Modal actions
if (modalCopy) modalCopy.onclick = async () => {
  const val = modalInput.value || '';
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(val);
      alert('Copied to clipboard!');
      copyModal.style.display = 'none';
      return;
    }
  } catch (e) { }
  try {
    modalInput.select();
    const ok = document.execCommand('copy');
    if (ok) alert('Copied to clipboard!');
    else alert('Copy failed — please select and press Ctrl/Cmd + C');
  } catch (e) { alert('Copy failed — please select and press Ctrl/Cmd + C'); }
  copyModal.style.display = 'none';
}
if (modalClose) modalClose.onclick = () => { copyModal.style.display = 'none'; }

// import/export handlers
if (exportBtn) exportBtn.onclick = () => {
  const rawArr = readHistory();
  const blob = new Blob([JSON.stringify(rawArr)], { type: 'application/json' });
  const blobUrl = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = blobUrl; a.download = 'pronounce-history.json'; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(blobUrl), 500);
}

if (importBtn) importBtn.onclick = () => importFile.click();
if (importFile) importFile.onchange = async (e) => {
  const f = e.target.files[0]; if (!f) return;
  const text = await f.text();
  try { const parsed = JSON.parse(text); if (Array.isArray(parsed)) { writeHistory(parsed); renderHistory(); alert('Imported!'); } else { alert('Invalid file: expected an array of history items'); } }
  catch (err) { alert('Invalid file'); }
}

/* ---------------- theme handlers (kept + improved) ---------------- */

const setLightTheme = () => {
  const root = document.documentElement;
  root.style.setProperty('--bg-start', '#f6f8fb');
  root.style.setProperty('--bg-end', '#eef3fb');
  root.style.setProperty('--wrap-bg', 'linear-gradient(180deg,#ffffff,#fbfdff)');
  root.style.setProperty('--card', 'rgba(255,255,255,0.98)');
  root.style.setProperty('--card-border', 'rgba(15,23,42,0.06)');
  root.style.setProperty('--accent', '#8b5cf6');
  root.style.setProperty('--muted', '#475569');
  root.style.setProperty('--glass', 'rgba(11,15,30,0.02)');
  root.style.setProperty('--card-shadow', '0 8px 20px rgba(11,15,30,0.06)');
  root.style.setProperty('--inner-shine', 'linear-gradient(180deg, rgba(255,255,255,0.6), rgba(255,255,255,0.02))');
  root.classList.add('light');
  document.body.style.color = '#071029';
  document.querySelectorAll('.wrap').forEach(el => {
    el.style.background = getComputedStyle(root).getPropertyValue('--wrap-bg') || 'linear-gradient(180deg,#fff,#fbfdff)';
    el.style.boxShadow = getComputedStyle(root).getPropertyValue('--card-shadow');
    el.style.borderRadius = '14px';
  });
  document.querySelectorAll('.card, .modal-card').forEach(el => {
    el.style.background = 'var(--card)';
    el.style.color = '#071029';
    const cardBorder = getComputedStyle(root).getPropertyValue('--card-border').trim() || 'rgba(15,23,42,0.06)';
    el.style.border = '1px solid ' + cardBorder;
    el.style.boxShadow = '0 6px 18px rgba(11,15,30,0.04)';
  });
  document.querySelectorAll('textarea, input, select').forEach(el => {
    el.style.background = '#fff';
    el.style.color = '#071029';
    el.style.border = '1px solid rgba(15,23,42,0.06)';
  });
  document.querySelectorAll('.small-btn').forEach(b => {
    b.style.background = 'transparent';
    b.style.border = '1px solid rgba(15,23,42,0.06)';
    b.style.color = '#374151';
  });
  document.querySelectorAll('button.btn').forEach(b => {
    b.style.background = 'linear-gradient(90deg,var(--accent),#6d28d9)';
    b.style.color = '#fff';
    b.style.boxShadow = '0 6px 18px rgba(99,102,241,0.08)';
  });
  document.querySelectorAll('.tag').forEach(t => {
    t.style.background = 'rgba(15,23,42,0.03)';
    t.style.border = '1px solid rgba(15,23,42,0.04)';
    t.style.color = '#0b1220';
  });
  try { localStorage.setItem('site_theme', 'light'); } catch (e) { }
};

const setDarkTheme = () => {
  const root = document.documentElement;
  root.style.setProperty('--bg-start', '#071029');
  root.style.setProperty('--bg-end', '#0b1530');
  root.style.setProperty('--wrap-bg', 'linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))');
  root.style.setProperty('--card', 'rgba(255,255,255,0.02)');
  root.style.setProperty('--card-border', 'rgba(255,255,255,0.04)');
  root.style.setProperty('--accent', '#6ee7b7');
  root.style.setProperty('--muted', '#94a3b8');
  root.style.setProperty('--glass', 'rgba(255,255,255,0.03)');
  root.style.setProperty('--card-shadow', '0 8px 30px rgba(2,6,23,0.6)');
  root.style.setProperty('--inner-shine', 'none');
  root.classList.remove('light');
  document.body.style.color = '#e6eef8';
  document.querySelectorAll('.wrap, .card, .modal-card, textarea, input, select, .small-btn, button.btn, .tag').forEach(el => {
    el.style.background = '';
    el.style.color = '';
    el.style.border = '';
    el.style.boxShadow = '';
  });
  try { localStorage.setItem('site_theme', 'dark'); } catch (e) { }
};

if (window.themeLight) themeLight.onclick = setLightTheme;
if (window.themeDark) themeDark.onclick = setDarkTheme;

(function initTheme() {
  try {
    const saved = localStorage.getItem('site_theme');
    if (saved === 'light') setLightTheme();
    else if (saved === 'dark') setDarkTheme();
    else {
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) setDarkTheme(); else setLightTheme();
    }
  } catch (e) { }
})();

/* ---------------- shortcuts / startup / live update ---------------- */

window.addEventListener('keydown', e => { if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { if (speakBtn) speakBtn.click(); } });

window.addEventListener('load', () => {
  renderHistory();
  const q = new URLSearchParams(location.search).get('q');
  if (q && txt) { txt.value = decodeURIComponent(q); updateMeta(); }
  updateMeta();
});

if (txt) txt.addEventListener('input', () => updateMeta());

/* ---------------- final notes ----------------
   If Google TTS download fails due to CORS in your browser/network:
   - Try in incognito or another browser (Chrome/Edge)
   - Or run the page under a simple local server (npx http-server) — you already do that
   - If you want me to switch to a local TTS server (Flask) or to use a paid API, I can patch that too.
*/

/* EOF */
