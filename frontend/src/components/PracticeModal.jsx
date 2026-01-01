import React, { useState, useEffect } from 'react';

const PracticeModal = ({ word, onClose, onSaveSentence, previousSentences }) => {
    const [sentence, setSentence] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!sentence.trim()) return;
        setLoading(true);
        await onSaveSentence(word.id, sentence);
        setSentence('');
        setLoading(false);
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 w-full max-w-lg shadow-2xl transform transition-all scale-100">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h3 className="text-xl font-bold text-white">Practice with "{word.english}"</h3>
                        <p className="text-sm text-gray-400 mt-1">Write a sentence using this word.</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="mb-6">
                    <textarea
                        value={sentence}
                        onChange={(e) => setSentence(e.target.value)}
                        className="w-full bg-slate-900/50 border border-slate-700 rounded-xl p-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none h-32"
                        placeholder="Example: The sunset was ephemeral but beautiful..."
                        required
                    />
                    <div className="flex justify-end mt-3">
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2 px-6 rounded-lg transition-colors disabled:opacity-50"
                        >
                            {loading ? 'Saving...' : 'Save Sentence'}
                        </button>
                    </div>
                </form>

                {previousSentences && previousSentences.length > 0 && (
                    <div className="border-t border-slate-700 pt-4">
                        <h4 className="text-sm font-semibold text-gray-300 mb-3">Your Previous Sentences</h4>
                        <div className="space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                            {previousSentences.map((s, idx) => (
                                <div key={idx} className="bg-slate-900/30 p-3 rounded-lg text-gray-300 text-sm italic border-l-2 border-blue-500/50">
                                    "{s.content}"
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PracticeModal;
