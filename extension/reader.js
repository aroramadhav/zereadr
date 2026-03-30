// QuicRead RSVP Reader logic
let words = [];
let current = 0;
let timer = null;
let wpm = 300;

const rsvpBox = document.getElementById('rsvpBox');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const wpmInput = document.getElementById('wpmInput');

// Listen for text from popup.js
let fullText = '';
const textDisplay = document.getElementById('textDisplay');
let wordIndices = [];

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.action === 'quicread_text') {
    fullText = msg.text;
    words = msg.text.split(/\s+/).filter(Boolean);
    current = 0;
    rsvpBox.textContent = 'Ready...';
    renderTextDisplay(fullText);
  }
});

function renderTextDisplay(text, highlightIdx = -1) {
  // Split into paragraphs by double newlines or sentence boundaries
  let paras = text.split(/\n\s*\n|(?<=[.!?])\s{2,}/g);
  textDisplay.innerHTML = '';
  let wordCount = 0;
  wordIndices = [];
  for (let para of paras) {
    if (para.trim()) {
      let p = document.createElement('p');
      p.style.margin = '1.2em 0';
      p.style.padding = '0 0.5em';
      p.style.lineHeight = '1.7';
      // Split paragraph into words
      let paraWords = para.trim().split(/\s+/);
      paraWords.forEach((w, i) => {
        let span = document.createElement('span');
        span.textContent = w + ' ';
        if (wordCount === highlightIdx) {
          span.style.background = '#ff5252';
          span.style.color = '#fff';
          span.style.borderRadius = '4px';
          span.style.padding = '0 2px';
        }
        wordIndices.push(span);
        p.appendChild(span);
        wordCount++;
      });
      textDisplay.appendChild(p);
    }
  }
}

function showWord(idx) {
  if (!words.length) return;
  const word = words[idx] || '';
  rsvpBox.innerHTML = highlightCenter(word);
  renderTextDisplay(fullText, idx);
}

function highlightCenter(word) {
  if (!word) return '';
  const len = word.length;
  if (len === 1) return `<span style="color:#ff5252;">${word}</span>`;
  const center = Math.floor((len - 1) / 2);
  return (
    word.slice(0, center) +
    `<span style="color:#ff5252;">${word[center]}</span>` +
    word.slice(center + 1)
  );
}

function startRSVP() {
  if (!words.length) return;
  startBtn.style.display = 'none';
  pauseBtn.style.display = '';
  timer = setInterval(() => {
    showWord(current);
    current++;
    if (current >= words.length) {
      clearInterval(timer);
      startBtn.style.display = '';
      pauseBtn.style.display = 'none';
      rsvpBox.textContent = 'Done!';
    }
  }, 60000 / wpm);
}

function pauseRSVP() {
  clearInterval(timer);
  startBtn.style.display = '';
  pauseBtn.style.display = 'none';
}

startBtn.addEventListener('click', startRSVP);
pauseBtn.addEventListener('click', pauseRSVP);
wpmInput.addEventListener('input', () => {
  wpm = Number(wpmInput.value) || 300;
  if (timer) {
    pauseRSVP();
    startRSVP();
  }
});

// Load WPM from storage
chrome.storage.local.get(['quicread_wpm'], (result) => {
  if (result.quicread_wpm) {
    wpm = result.quicread_wpm;
    wpmInput.value = wpm;
  }
});

// Request text from popup on load
chrome.runtime.sendMessage({ action: 'quicread_request_text' });
