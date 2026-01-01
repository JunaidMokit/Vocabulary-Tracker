import React, { useState } from 'react';
import { addWord } from '../api';

const WordForm = ({ onWordAdded }) => {
    const [english, setEnglish] = useState('');
    const [bangla, setBangla] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!english || !bangla) return;
        setLoading(true);
        try {
            await addWord({ english, bangla });
            setEnglish('');
            setBangla('');
            onWordAdded();
        } catch (error) {
            console.error("Error adding word:", error);
            alert("Failed to add word");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 shadow-xl mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">Add New Word</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-200 mb-1">English Word</label>
                    <input
                        type="text"
                        value={english}
                        onChange={(e) => setEnglish(e.target.value)}
                        className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                        placeholder="e.g., Apple"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-200 mb-1">Bangla Meaning</label>
                    <input
                        type="text"
                        value={bangla}
                        onChange={(e) => setBangla(e.target.value)}
                        className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                        placeholder="e.g., আপেল"
                        required
                    />
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold py-2 px-4 rounded-lg hover:from-blue-600 hover:to-purple-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02]"
                >
                    {loading ? 'Adding...' : 'Add Word'}
                </button>
            </form>
        </div>
    );
};

export default WordForm;
