```javascript
const API_URL = "http://localhost:8080/api";

// State
let allWords = [];
let savedList = [];
let savedIds = new Set();
let currentTab = 'browse'; // 'browse' | 'saved'
let practiceWord = null;

// DOM Elements
const wordGrid = document.getElementById('word-grid');
const searchInput = document.getElementById('search-input');
const tabBrowse = document.getElementById('tab-browse');
const tabSaved = document.getElementById('tab-saved');
const savedCount = document.getElementById('saved-count');
const sectionTitle = document.getElementById('section-title');
const modalOverlay = document.getElementById('modal-overlay');
const modalWordEnglish = document.getElementById('modal-word-english');
const sentenceInput = document.getElementById('sentence-input');
const prevSentencesContainer = document.getElementById('previous-sentences-container');
const prevSentencesList = document.getElementById('previous-sentences-list');

// Initialization
async function init() {
    await loadData();
    render();

    // Search Listener
    searchInput.addEventListener('input', () => {
        render();
    });
}

async function loadData() {
    try {
        const [wordsRes, savedRes] = await Promise.all([
            fetch(`${ API_URL }/words`),
fetch(`${API_URL}/saved-words`)
        ]);

if (wordsRes.ok) allWords = await wordsRes.json();
if (savedRes.ok) savedList = (await savedRes.json()) || [];

// Map Saved IDs
savedIds = new Set(savedList.map(s => s.wordId));

// Update Count
savedCount.innerText = `(${savedList.length})`;
    } catch (err) {
    console.error("Error loading data:", err);
}
}

// Helper: Format Date
function formatDate(dateStr) {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return "Today";
    if (date.toDateString() === yesterday.toDateString()) return "Yesterday";

    return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
}


// Rendering
function render() {
    wordGrid.innerHTML = '';

    // Determine words to show
    let displayWords = [];
    const searchQuery = searchInput.value.toLowerCase().trim();

    if (currentTab === 'browse') {
        displayWords = allWords;
        sectionTitle.innerHTML = '<span class="text-blue-400">📚</span> Explore Vocabulary';

        // Update Tabs UI
        tabBrowse.className = "px-8 py-3 rounded-full font-semibold transition-all transform hover:scale-105 bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/30";
        tabSaved.className = "px-8 py-3 rounded-full font-semibold transition-all transform hover:scale-105 bg-slate-800 text-gray-400 hover:bg-slate-700 hover:text-white";
    } else {
        displayWords = allWords.filter(w => savedIds.has(w.id));
        sectionTitle.innerHTML = '<span class="text-purple-400">★</span> My Collection';

        // Update Tabs UI
        tabSaved.className = "px-8 py-3 rounded-full font-semibold transition-all transform hover:scale-105 bg-gradient-to-r from-purple-600 to-purple-500 text-white shadow-lg shadow-purple-500/30";
        tabBrowse.className = "px-8 py-3 rounded-full font-semibold transition-all transform hover:scale-105 bg-slate-800 text-gray-400 hover:bg-slate-700 hover:text-white";
    }

    if (displayWords.length === 0) {
        wordGrid.innerHTML = `
            <div class="col-span-full text-center py-12 text-gray-500">
                <p class="text-lg">No words found here yet.</p>
            </div>
        `;
        return;
    }

    if (currentTab === 'browse') {

        // --- BROWSE TAB RENDER ---
        displayWords.forEach(word => {
            // Search Filter
            if (searchQuery && !word.english.toLowerCase().includes(searchQuery)) return;

            const isSaved = savedIds.has(word.id);
            // ... Logic for Browse Card ...
            const card = createCard(word, isSaved, false);
            wordGrid.appendChild(card);
        });

    } else {

        // --- SAVED TAB RENDER (GROUPED BY DATE) ---
        // 1. Join Saved Info with Words
        const savedExtended = savedList.map(s => {
            const w = allWords.find(wd => wd.id === s.wordId);
            return { ...w, savedAt: s.savedAt };
        }).filter(item => item.id); // Filter out any missing words

        // 2. Sort by Date Descending
        savedExtended.sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt));

        // 3. Search Filter for Saved
        const filteredSaved = savedExtended.filter(item =>
            !searchQuery || item.english.toLowerCase().includes(searchQuery)
        );

        if (filteredSaved.length === 0 && savedExtended.length > 0) {
            wordGrid.innerHTML = `
                <div class="col-span-full text-center py-12 text-gray-500">
                    <p class="text-lg">No saved words match your search.</p>
                </div>
            `;
            return;
        }

        // 4. Group
        const grouped = {};
        filteredSaved.forEach(item => {
            const dateLabel = formatDate(item.savedAt);
            if (!grouped[dateLabel]) grouped[dateLabel] = [];
            grouped[dateLabel].push(item);
        });

        // 5. Render Groups
        for (const [date, items] of Object.entries(grouped)) {
            // Date Header
            const header = document.createElement('h3');
            header.className = "col-span-full text-lg font-semibold text-gray-400 mt-6 mb-2 border-b border-gray-700/50 pb-1";
            header.innerText = date;
            wordGrid.appendChild(header);

            // Cards
            items.forEach(word => {
                const card = createCard(word, true, true);
                wordGrid.appendChild(card);
            });
        }
    }
}

// Helper: Create Card Element
function createCard(word, isSaved, isSavedView) {
    const card = document.createElement('div');
    card.className = "relative bg-slate-800/50 border border-slate-700/50 rounded-xl p-5 hover:bg-slate-700/50 transition-all group hover:-translate-y-1 hover:shadow-lg hover:shadow-blue-900/20";

    let actionButton = '';
    if (isSavedView) {
        actionButton = `
            <button onclick="removeWord(event, '${word.id}')" class="text-gray-500 hover:text-red-400 p-1" title="Remove from list">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
            </button>
        `;
    } else if (!isSaved) {
        actionButton = `
            <button onclick="saveWord('${word.id}')" class="text-gray-500 hover:text-green-400 p-1 transition-colors" title="Save to My List">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
            </button>
        `;
    }

    let savedIndicator = (!isSaved || isSavedView) ? '' : `
        <div class="absolute top-5 right-5 text-green-500">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
            </svg>
        </div>
    `;

    let meaning = (!isSavedView) ? `
        <div class="text-gray-400 text-lg border-t border-slate-700/50 pt-2 mt-2">
            ${word.bangla}
        </div>
    ` : '';

    let practicePrompt = (isSavedView) ? `
        <div class="mt-3 text-sm text-gray-500 group-hover:text-gray-300 transition-colors flex items-center cursor-pointer">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            Click to practice
        </div>
    ` : '';

    // Click handler for card
    const clickAction = (isSavedView) ? `onclick="openModal('${word.id}')"` : '';

    card.innerHTML = `
            <h3 class="text-xl font-bold ${isSavedView ? 'text-purple-300' : 'text-blue-300'} group-hover:text-white transition-colors cursor-pointer flex items-center gap-2" ${clickAction}>
                ${word.english}
                <button onclick="speakWord(event, '${word.english}')" class="text-gray-500 hover:text-yellow-400 transition-colors p-1 rounded-full hover:bg-white/10" title="Pronounce">
                     <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                </button>
            </h3>
            ${actionButton}
        ${meaning}
        ${savedIndicator}
        ${practicePrompt}
    `;

    if (isSavedView) {
        card.onclick = (e) => {
            // Prevent firing if button was clicked
            if (e.target.closest('button')) return;
            openModal(word.id);
        };
    }

    return card;

}

// User Actions
function switchTab(tab) {
    currentTab = tab;
    render();
}

async function saveWord(id) {
    try {
        const res = await fetch(`${API_URL}/saved-words`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ wordId: id })
        });
        if (res.ok) {
            await loadData();
            render();
        }
    } catch (err) {
        console.error("Error saving word:", err);
    }
}

async function removeWord(e, id) {
    e.stopPropagation();
    try {
        const res = await fetch(`${API_URL}/saved-words?id=${id}`, {
            method: 'DELETE'
        });
        if (res.ok) {
            await loadData();
            render();
        }
    } catch (err) {
        console.error("Error removing word:", err);
    }
}


// Text-to-Speech
function speakWord(e, text) {
    if (e) e.stopPropagation();

    // Cancel any current speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.9; // Slightly slower for clarity

    // Optional: Select a better voice if available
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => v.name.includes("Google US English") || v.name.includes("Samantha"));
    if (preferredVoice) utterance.voice = preferredVoice;

    window.speechSynthesis.speak(utterance);
}

// Modal Logic
async function openModal(id) {
    practiceWord = allWords.find(w => w.id === id);
    if (!practiceWord) return;

    modalWordEnglish.innerText = practiceWord.english;
    modalOverlay.classList.remove('hidden');
    modalOverlay.classList.add('flex');
    sentenceInput.value = '';

    // Load Previous Sentences
    loadSentences(id);
}

function closeModal() {
    modalOverlay.classList.add('hidden');
    modalOverlay.classList.remove('flex');
    practiceWord = null;
}

async function loadSentences(id) {
    prevSentencesContainer.classList.add('hidden');
    prevSentencesList.innerHTML = '';

    try {
        const res = await fetch(`${API_URL}/sentences?wordId=${id}`);
        if (res.ok) {
            const sentences = await res.json();
            if (sentences && sentences.length > 0) {
                prevSentencesContainer.classList.remove('hidden');
                prevSentencesList.innerHTML = sentences.map(s => `
                    <div class="bg-slate-700/50 p-2 rounded text-sm text-gray-300 border-l-2 border-blue-500">
                        ${s.content}
                    </div>
                `).join('');
            }
        }
    } catch (err) {
        console.error("Error loading sentences:", err);
    }

    modalOverlay.classList.remove('hidden');
    modalOverlay.classList.add('flex');
    sentenceInput.focus();
}

async function saveSentence() {
    if (!practiceWord || !sentenceInput.value.trim()) return;

    try {
        const res = await fetch(`${API_URL}/sentences`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ wordId: practiceWord.id, content: sentenceInput.value })
        });

        if (res.ok) {
            sentenceInput.value = '';
            loadSentences(practiceWord.id);
        }
    } catch (err) {
        console.error("Error saving sentence:", err);
    }
}

// Start
init();
```
