import React from 'react';

const WordList = ({ words, isSavedList, onSaveWord, onRemoveWord, onPractice, savedIds }) => {
    return (
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-2xl">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                {isSavedList ? (
                    <>
                        <span className="text-purple-400">★</span> My Collection
                    </>
                ) : (
                    <>
                        <span className="text-blue-400">📚</span> Explore Vocabulary
                    </>
                )}
            </h2>

            {words.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                    <p className="text-lg">No words found here yet.</p>
                </div>
            ) : (
                <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                    {words.map((word) => {
                        const isAlreadySaved = savedIds?.has(word.id);

                        return (
                            <div key={word.id} className="relative bg-slate-800/50 border border-slate-700/50 rounded-xl p-5 hover:bg-slate-700/50 transition-all group hover:-translate-y-1 hover:shadow-lg hover:shadow-blue-900/20">
                                {/* Header: English Word */}
                                <div className="flex justify-between items-start mb-2">
                                    <h3
                                        className={`text-xl font-bold ${isSavedList ? 'text-purple-300' : 'text-blue-300'} group-hover:text-white transition-colors cursor-pointer`}
                                        onClick={() => isSavedList && onPractice(word)}
                                    >
                                        {word.english}
                                    </h3>

                                    {isSavedList ? (
                                        <button
                                            onClick={(e) => { e.stopPropagation(); onRemoveWord(word.id); }}
                                            className="text-gray-500 hover:text-red-400 p-1"
                                            title="Remove from list"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                    ) : (
                                        !isAlreadySaved && (
                                            <button
                                                onClick={() => onSaveWord(word.id)}
                                                className="text-gray-500 hover:text-green-400 p-1 transition-colors"
                                                title="Save to My List"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                                                </svg>
                                            </button>
                                        )
                                    )}
                                </div>

                                {/* Meaning: Hidden in Saved List unless maybe hovered or just hidden as requested */}
                                {!isSavedList && (
                                    <div className="text-gray-400 text-lg border-t border-slate-700/50 pt-2 mt-2">
                                        {word.bangla}
                                    </div>
                                )}

                                {/* Saved Indicator in Browse Mode */}
                                {!isSavedList && isAlreadySaved && (
                                    <div className="absolute top-5 right-5 text-green-500">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                                            <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
                                        </svg>
                                    </div>
                                )}

                                {/* Practice Prompt in Saved List */}
                                {isSavedList && (
                                    <div className="mt-3 text-sm text-gray-500 group-hover:text-gray-300 transition-colors flex items-center cursor-pointer" onClick={() => onPractice(word)}>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                        </svg>
                                        Click to practice
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    );
};

export default WordList;
