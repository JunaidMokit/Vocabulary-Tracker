package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"sync"
	"time"
)

type Word struct {
	ID      string `json:"id"`
	English string `json:"english"`
	Bangla  string `json:"bangla"`
}

type SavedWord struct {
	WordID  string    `json:"wordId"`
	SavedAt time.Time `json:"savedAt"`
}

type Sentence struct {
	WordID  string `json:"wordId"`
	Content string `json:"content"`
}

var (
	wordsFile     = "words.json"
	savedFile     = "saved_words.json"
	sentencesFile = "sentences.json"
	mutex         sync.Mutex
)

// CORS Middleware
func enableCors(w *http.ResponseWriter) {
	(*w).Header().Set("Access-Control-Allow-Origin", "*")
	(*w).Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")
	(*w).Header().Set("Access-Control-Allow-Headers", "Accept, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization")
}

// Helpers
func loadJSON(filename string, target interface{}) error {
	file, err := ioutil.ReadFile(filename)
	if err != nil {
		if os.IsNotExist(err) {
			return nil // Return empty if file doesn't exist
		}
		return err
	}
	if len(file) == 0 {
		return nil
	}
	return json.Unmarshal(file, target)
}

func saveJSON(filename string, data interface{}) error {
	updatedData, err := json.MarshalIndent(data, "", "  ")
	if err != nil {
		return err
	}
	return ioutil.WriteFile(filename, updatedData, 0644)
}

// Handlers
func getWords(w http.ResponseWriter, r *http.Request) {
	enableCors(&w)
	if r.Method == "OPTIONS" {
		return
	}

	mutex.Lock()
	defer mutex.Unlock()

	var words []Word
	if err := loadJSON(wordsFile, &words); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// If words are empty, seed them if seeds.json exists (Automatic Seeding for demo)
	if len(words) == 0 {
		var seeds []struct {
			English string `json:"english"`
			Bangla  string `json:"bangla"`
		}
		if err := loadJSON("seeds.json", &seeds); err == nil && len(seeds) > 0 {
			for i, s := range seeds {
				words = append(words, Word{
					ID:      fmt.Sprintf("w%d", i+1),
					English: s.English,
					Bangla:  s.Bangla,
				})
			}
			saveJSON(wordsFile, words)
		}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(words)
}

func addWord(w http.ResponseWriter, r *http.Request) {
	enableCors(&w)
	if r.Method == "OPTIONS" {
		return
	}

	var newWord Word
	if err := json.NewDecoder(r.Body).Decode(&newWord); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	mutex.Lock()
	defer mutex.Unlock()

	var words []Word
	loadJSON(wordsFile, &words)

	// Generate ID
	newWord.ID = fmt.Sprintf("w%d", time.Now().UnixNano())
	words = append(words, newWord)

	if err := saveJSON(wordsFile, words); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(newWord)
}

func savedWordsHandler(w http.ResponseWriter, r *http.Request) {
	enableCors(&w)
	if r.Method == "OPTIONS" {
		return
	}

	mutex.Lock()
	defer mutex.Unlock()

	var saved []SavedWord
	loadJSON(savedFile, &saved)

	if r.Method == "GET" {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(saved)
		return
	}

	if r.Method == "POST" {
		var req struct {
			WordID string `json:"wordId"`
		}
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		// Check for duplicates
		for _, s := range saved {
			if s.WordID == req.WordID {
				w.WriteHeader(http.StatusOK) // Already saved
				return
			}
		}

		saved = append(saved, SavedWord{
			WordID:  req.WordID,
			SavedAt: time.Now(),
		})
		saveJSON(savedFile, saved)
		w.WriteHeader(http.StatusCreated)
		return
	}

	if r.Method == "DELETE" {
		id := r.URL.Query().Get("id")
		if id == "" {
			http.Error(w, "id required", http.StatusBadRequest)
			return
		}

		newSaved := []SavedWord{}
		for _, s := range saved {
			if s.WordID != id {
				newSaved = append(newSaved, s)
			}
		}
		saveJSON(savedFile, newSaved)
		w.WriteHeader(http.StatusOK)
		return
	}
}

func sentencesHandler(w http.ResponseWriter, r *http.Request) {
	enableCors(&w)
	if r.Method == "OPTIONS" {
		return
	}

	mutex.Lock()
	defer mutex.Unlock()

	var sentences []Sentence
	loadJSON(sentencesFile, &sentences)

	if r.Method == "GET" {
		// Filter by wordID if present
		wordID := r.URL.Query().Get("wordId")
		filtered := []Sentence{}
		for _, s := range sentences {
			if wordID == "" || s.WordID == wordID {
				filtered = append(filtered, s)
			}
		}
		json.NewEncoder(w).Encode(filtered)
		return
	}

	if r.Method == "POST" {
		var newSentence Sentence
		if err := json.NewDecoder(r.Body).Decode(&newSentence); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		sentences = append(sentences, newSentence)
		saveJSON(sentencesFile, sentences)
		w.WriteHeader(http.StatusCreated)
		return
	}
}

func main() {
	http.HandleFunc("/api/words", func(w http.ResponseWriter, r *http.Request) {
		if r.Method == "GET" {
			getWords(w, r)
		} else if r.Method == "POST" {
			addWord(w, r)
		} else if r.Method == "OPTIONS" {
			enableCors(&w)
		}
	})

	http.HandleFunc("/api/saved-words", savedWordsHandler)
	http.HandleFunc("/api/sentences", sentencesHandler)

	fmt.Println("Server running on port 8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}
