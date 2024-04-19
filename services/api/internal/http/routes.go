package http

import (
	"encoding/json"
	"net/http"
	"time"

	api "github.com/jacobschwantes/quizblitz/services/api/internal"
)

func quizzes(qr api.QuizRepository) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != "GET" {
			http.Error(w, "Invalid method", http.StatusMethodNotAllowed)
			return
		}

		userID := getUserID(r.Context())
		if userID == "" {
			http.Error(w, "Failed to get userID from context", http.StatusInternalServerError)
			return
		}

		quizzes, err := qr.Quizzes(userID)
		if err != nil {
			http.Error(w, "Failed to get quizzes", http.StatusInternalServerError)
			return
		}

		jsonData, err := json.Marshal(quizzes)
		if err != nil {
			http.Error(w, "Failed to marshal response", http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		w.Write(jsonData)
	}
}

func quizByID(qr api.QuizRepository) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		userID := getUserID(r.Context())
		if userID == "" {
			http.Error(w, "Failed to get userID from context", http.StatusInternalServerError)
			return
		}

		quizID := r.PathValue("id")
		if quizID == "" {
			http.Error(w, "Missing required id", http.StatusBadRequest)
			return
		}

		quiz, err := qr.Quiz(quizID)
		if err != nil {
			http.Error(w, "Quiz not found", http.StatusNotFound)
			return
		}

		switch r.Method {
		case http.MethodGet:
			if !quiz.Meta.Public && quiz.OwnerID != userID {
				http.Error(w, "Unauthorized access", http.StatusUnauthorized)
				return
			}

			jsonData, err := json.Marshal(quiz)
			if err != nil {
				http.Error(w, "Failed to marshal response", http.StatusInternalServerError)
				return
			}

			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusOK)
			w.Write(jsonData)

		case http.MethodPut:
			var quizReq api.Quiz
			if err := json.NewDecoder(r.Body).Decode(&quizReq); err != nil {
				http.Error(w, "Failed to decode request body", http.StatusBadRequest)
				return
			}

			if quiz.OwnerID != userID {
				http.Error(w, "User does not have edit permission", http.StatusUnauthorized)
				return
			}

			quiz.UpdatedAt = time.Now()
			quiz.Meta = quizReq.Meta
			quiz.Questions = quizReq.Questions

			err = qr.UpdateQuiz(quizID, *quiz)
			if err != nil {
				http.Error(w, "Failed to update quiz", http.StatusInternalServerError)
				return
			}
			w.WriteHeader(http.StatusOK)
			w.Write([]byte("Quiz updated successfully"))

		case http.MethodDelete:
			if quiz.OwnerID != userID {
				http.Error(w, "User is not the owner", http.StatusUnauthorized)
				return
			}

			err = qr.DeleteQuiz(quizID)
			if err != nil {
				http.Error(w, "Failed to delete quiz", http.StatusInternalServerError)
				return
			}

			w.WriteHeader(http.StatusOK)
			w.Write([]byte("Quiz deleted successfully"))

		default:
			http.Error(w, "Invalid method", http.StatusMethodNotAllowed)
		}
	}
}

func quiz(qr api.QuizRepository) http.HandlerFunc {
	type quizCreateResponse struct {
		ID string `json:"id"`
	}
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != "POST" {
			http.Error(w, "Invalid method", http.StatusMethodNotAllowed)
			return
		}

		userID := getUserID(r.Context())
		if userID == "" {
			http.Error(w, "Failed to get userID from context", http.StatusInternalServerError)
			return
		}

		var quiz api.Quiz
		if err := json.NewDecoder(r.Body).Decode(&quiz); err != nil {
			http.Error(w, "Failed to decode request body", http.StatusBadRequest)
			return
		}
		quiz.OwnerID = userID
		// ? not sure if this is needed
		quiz.Stats = api.QuizStats{
			Plays: 0,
			Stars: 0,
		}
		now := time.Now()
		quiz.CreatedAt = now
		quiz.UpdatedAt = now

		id, err := qr.InsertQuiz(quiz)
		if err != nil {
			http.Error(w, "Failed to create quiz", http.StatusInternalServerError)
			return
		}

		resp := quizCreateResponse{
			ID: id,
		}

		jsonData, err := json.Marshal(resp)
		if err != nil {
			http.Error(w, "Failed to marshal response", http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusCreated)
		w.Write(jsonData)
	}
}
