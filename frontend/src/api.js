const API_URL = "http://localhost:8080/api";

export const getWords = async () => {
    const response = await fetch(`${API_URL}/words`);
    if (!response.ok) throw new Error("Failed to fetch words");
    return response.json();
};

export const addWord = async (word) => {
    const response = await fetch(`${API_URL}/words`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(word),
    });
    if (!response.ok) throw new Error("Failed to add word");
    return response.json();
};

export const getSavedWords = async () => {
    const response = await fetch(`${API_URL}/saved-words`);
    if (!response.ok) throw new Error("Failed to fetch saved words");
    return response.json();
};

export const saveWord = async (wordId) => {
    const response = await fetch(`${API_URL}/saved-words`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wordId }),
    });
    if (!response.ok) throw new Error("Failed to save word");
    return response.json();
};

export const removeSavedWord = async (wordId) => {
    const response = await fetch(`${API_URL}/saved-words?id=${wordId}`, {
        method: "DELETE",
    });
    if (!response.ok) throw new Error("Failed to remove saved word");
    return response.json(); // May be empty
};

export const getSentences = async (wordId) => {
    const response = await fetch(`${API_URL}/sentences?wordId=${wordId}`);
    if (!response.ok) throw new Error("Failed to fetch sentences");
    return response.json();
};

export const saveSentence = async (wordId, content) => {
    const response = await fetch(`${API_URL}/sentences`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wordId, content }),
    });
    if (!response.ok) throw new Error("Failed to save sentence");
    return response.json();
};
