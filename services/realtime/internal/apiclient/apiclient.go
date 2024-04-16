package apiclient

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"time"

	"github.com/jacobschwantes/quizblitz/services/realtime/internal"
)

// TODO: implement standardized encoder, decoder
type apiClient struct {
	BaseURL    string
	HTTPClient *http.Client
	AuthToken  string
}

func New(baseURL string) realtime.APIClient {
	return &apiClient{
		BaseURL: baseURL,
		HTTPClient: &http.Client{
			Timeout: time.Second * 10,
		},
		// ! this might not be secure
		AuthToken: fmt.Sprintf("Bearer %s", os.Getenv("INTERNAL_API_KEY")),
	}
}

func (c *apiClient) ValidateAuthToken(token string) (*realtime.UserInfo, error) {
	url := fmt.Sprintf("%s/auth/validate?token=%s", c.BaseURL, token)
	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		fmt.Printf("Failed to create request: %v\n", err)
		return nil, err
	}

	// Add the authorization header
	req.Header.Set("Authorization", c.AuthToken)

	// Make the request
	resp, err := c.HTTPClient.Do(req)
	if err != nil {
		fmt.Printf("Failed to validate auth token: %v\n", err)
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		bodyBytes, _ := io.ReadAll(resp.Body) // Read the response body for logging
		fmt.Printf("API returned non-200 status code: %d, response: %s\n", resp.StatusCode, string(bodyBytes))
		return nil, fmt.Errorf("API returned non-200 status code: %d", resp.StatusCode)
	}

	var userInfo realtime.UserInfo
	if err := json.NewDecoder(resp.Body).Decode(&userInfo); err != nil {
		fmt.Printf("Failed to decode user info: %v\n", err)
		return nil, err
	}

	return &userInfo, nil
}

func (c *apiClient) GetLobbyCode() (string, error) {
	fmt.Println("getting lobby code")
	url := fmt.Sprintf("%s/lobby/create", c.BaseURL)
	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		fmt.Println("failed to create request")
		return "", err
	}

	// Add the authorization header
	req.Header.Set("Authorization", c.AuthToken)

	// Make the request
	resp, err := c.HTTPClient.Do(req)
	if err != nil {
		fmt.Println("failed to fetch lobby code")
		return "", err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		fmt.Println("non-200 status code")
		return "", fmt.Errorf("API returned non-200 status code: %d", resp.StatusCode)
	}

	var lobbyCode string
	if err := json.NewDecoder(resp.Body).Decode(&lobbyCode); err != nil {
		fmt.Println("failed to decode lobby code")
		return "", err
	}

	fmt.Println("got lobby code, %s", lobbyCode)

	return lobbyCode, nil
}

func (c *apiClient) PushLobbyStateUpdate(state realtime.LobbyStateUpdate) error {
	url := fmt.Sprintf("%s/lobby/update", c.BaseURL)

	stateJSON, err := json.Marshal(state)
	if err != nil {
		fmt.Println("failed to marshal lobby state")
		return err
	}

	req, err := http.NewRequest("POST", url, bytes.NewBuffer(stateJSON))
	if err != nil {
		fmt.Println("failed to create request for lobby state")
		return err
	}

	// Add the authorization header
	req.Header.Set("Authorization", c.AuthToken)

	// Make the request
	resp, err := c.HTTPClient.Do(req)
	if err != nil {
		fmt.Println("failed to push lobby state")
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		fmt.Println("non-200 status code")
		return fmt.Errorf("API returned non-200 status code: %d", resp.StatusCode)
	}

	return nil
}

func (c *apiClient) FetchQuiz(id string) (*realtime.Quiz, error) {
	url := fmt.Sprintf("%s/quiz?id=%s", c.BaseURL, id)

	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		fmt.Println("failed to create request for fetching quiz")
		return nil, err
	}

	req.Header.Set("Authorization", c.AuthToken)

	resp, err := c.HTTPClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("API returned non-200 status code: %d", resp.StatusCode)
	}

	var quiz realtime.Quiz
	if err := json.NewDecoder(resp.Body).Decode(&quiz); err != nil {
		return nil, err
	}

	return &quiz, nil
}

func encode[T any](w http.ResponseWriter, r *http.Request, status int, v T) error {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	if err := json.NewEncoder(w).Encode(v); err != nil {
		return fmt.Errorf("encode json: %w", err)
	}
	return nil
}

func decode[T any](r *http.Request) (T, error) {
	var v T
	if err := json.NewDecoder(r.Body).Decode(&v); err != nil {
		return v, fmt.Errorf("decode json: %w", err)
	}
	return v, nil
}

// err := encode(w, r, http.StatusOK, obj)
// decoded, err := decode[CreateSomethingRequest](r)

// we can check:
// - required fields are not empty
// - strings with a specific format like email are correct
// - numbers are within a certain range

// more complicated things like looking up values in a database should happen elsewhere
// these checks are too important to happen in a simple generalized validator and you wouldnt
// expect to find these checks in a function like this as it could be easily hidden away

func decodeValid[T Validator](r *http.Request) (T, map[string]string, error) {
	var v T
	if err := json.NewDecoder(r.Body).Decode(&v); err != nil {
		return v, nil, fmt.Errorf("decode json: %w", err)
	}
	if problems := v.Valid(r.Context()); len(problems) > 0 {
		return v, problems, fmt.Errorf("invalid %T: %d problems", v, len(problems))
	}
	return v, nil, nil
}

type Validator interface {
	Valid(ctx context.Context) (problems map[string]string)
}

// The Valid method takes a context (which is optional but has been useful for me in the past) and returns a map.
// If there is a problem with a field, its name is used as the key, and a human-readable explanation of the issue is set as the value.
