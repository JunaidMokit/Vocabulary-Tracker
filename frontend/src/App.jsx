```javascript
import React, { useState, useEffect } from 'react';
import WordList from './components/WordList';
import PracticeModal from './components/PracticeModal';
import { getWords, getSavedWords, saveWord, removeSavedWord, saveSentence, getSentences } from './api';

function App() {
    const [words, setWords] = useState([]);
    const [savedWords, setSavedWords] = useState([]);
    const [savedIds, setSavedIds] = useState(new Set());
    const [activeTab, setActiveTab] = useState('browse'); // 'browse' | 'saved'
    
    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentPracticeWord, setCurrentPracticeWord] = useState(null);
    const [previousSentences, setPreviousSentences] = useState([]);

    const loadData = async () => {
        try {
            const [allWords, savedList] = await Promise.all([getWords(), getSavedWords()]);
            setWords(allWords);
            setSavedWords(savedList);
            
            // Create a Set of saved IDs for easy lookup
            const ids = new Set(savedList.map(s => s.wordId));
            setSavedIds(ids);
        } catch (error) {
            console.error("Error loading data:", error);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    // Action Handlers
    const handleSaveWord = async (wordId) => {
        try {
            await saveWord(wordId);
            loadData(); // Reload to update state
        } catch (error) {
            console.error(error);
        }
    };

    const handleRemoveWord = async (wordId) => {
        try {
            await removeSavedWord(wordId);
            loadData();
        } catch (error) {
            console.error(error);
        }
    };

    const openPracticeModal = async (word) => {
        setCurrentPracticeWord(word);
        setIsModalOpen(true);
        try {
            const sentences = await getSentences(word.id);
            setPreviousSentences(sentences);
        } catch (error) {
            console.error(error);
            setPreviousSentences([]);
        }
    };

    const handleSaveSentence = async (wordId, content) => {
        try {
            await saveSentence(wordId, content);
            // Refresh sentences
            const sentences = await getSentences(wordId);
            setPreviousSentences(sentences);
        } catch (error) {
            console.error(error);
        }
    };

    // Filter words for display
    const getDisplayWords = () => {
        if (activeTab === 'browse') return words;
        // For saved tab, we match the saved IDs back to full word objects
        return words.filter(w => savedIds.has(w.id));
    };

    return (
        <div className="min-h-screen bg-slate-900 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-800 via-slate-900 to-black text-white font-sans flex flex-col">
            <div className="flex-grow max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <header className="mb-10 text-center">
                    <h1 className="text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 mb-2 animate-fade-in-down drop-shadow-2xl">
                        VocabBuilder <span className="text-2xl font-light text-gray-400 align-top">v2.0</span>
                    </h1>
                    <p className="text-xl text-gray-400 tracking-wide">Master your vocabulary with style and focus.</p>
                </header>

                {/* Navigation Tabs */}
                <div className="flex justify-center mb-10 space-x-4">
                    <button
                        onClick={() => setActiveTab('browse')}
                        className={`px - 8 py - 3 rounded - full font - semibold transition - all transform hover: scale - 105 ${
  activeTab === 'browse'
    ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/30'
    : 'bg-slate-800 text-gray-400 hover:bg-slate-700 hover:text-white'
} `}
                    >
                        Browse Words
                    </button>
                    <button
                        onClick={() => setActiveTab('saved')}
                        className={`px - 8 py - 3 rounded - full font - semibold transition - all transform hover: scale - 105 ${
  activeTab === 'saved'
    ? 'bg-gradient-to-r from-purple-600 to-purple-500 text-white shadow-lg shadow-purple-500/30'
    : 'bg-slate-800 text-gray-400 hover:bg-slate-700 hover:text-white'
} `}
                    >
                        My Saved List ({savedWords.length})
                    </button>
                </div>

                {/* Content Area */}
                <main className="animate-fade-in-up">
                    <WordList 
                        words={getDisplayWords()} 
                        isSavedList={activeTab === 'saved'}
                        onSaveWord={handleSaveWord}
                        onRemoveWord={handleRemoveWord}
                        onPractice={openPracticeModal}
                        savedIds={savedIds}
                    />
                </main>
            </div>

            {/* Footer */}
            <footer className="w-full bg-slate-900/80 border-t border-slate-800 py-8 mt-12 text-center backdrop-blur-sm">
                <p className="text-gray-500 text-sm">
                    Designed & Developed by <span className="text-blue-400 font-semibold">Junaid Rahman Mokit</span>
                </p>
                <div className="flex justify-center space-x-4 mt-4 opacity-50 hover:opacity-100 transition-opacity">
                   {/* Optional social icons could go here */}
                   <span className="text-xs text-gray-600">© 2026 VocabBuilder Inc.</span>
                </div>
            </footer>

            {/* Modals */}
            {isModalOpen && currentPracticeWord && (
                <PracticeModal 
                    word={currentPracticeWord}
                    onClose={() => setIsModalOpen(false)}
                    onSaveSentence={handleSaveSentence}
                    previousSentences={previousSentences}
                />
            )}
        </div>
    );
}

export default App;
```
