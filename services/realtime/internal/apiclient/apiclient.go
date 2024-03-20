package apiclient

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"time"
	"bytes"

	"github.com/jacobschwantes/quizblitz/services/realtime/internal"
)

// TODO: implement standardized encoder, decoder
// TODO: secure API requests with API key
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
		AuthToken: fmt.Sprintf("Bearer %s", os.Getenv("INTERNAL_API_TOKEN")),
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

func (c *apiClient) FetchSetData(setID int) (*realtime.SetData, error) {
	url := fmt.Sprintf("%s/sets/%d", c.BaseURL, setID)
	resp, err := c.HTTPClient.Get(url)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("API returned non-200 status code: %d", resp.StatusCode)
	}

	var setData realtime.SetData
	if err := json.NewDecoder(resp.Body).Decode(&setData); err != nil {
		return nil, err
	}

	return &setData, nil
}
