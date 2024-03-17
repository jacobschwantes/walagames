package apiclient

import (
	"encoding/json"
	"fmt"
	"net/http"
	"time"
	"github.com/jacobschwantes/quizblitz/services/realtime/internal"
	"io"
) 


type apiClient struct {
	BaseURL    string
	HTTPClient *http.Client
}

func New(baseURL string) realtime.APIClient {
	return &apiClient{
		BaseURL: baseURL,
		HTTPClient: &http.Client{
			Timeout: time.Second * 10,
		},
	}
}

// TODO: implement standardized encoder, decoder
// TODO: secure API requests with API key


func (c *apiClient) ValidateAuthToken(token string) (*realtime.UserInfo, error) {
	url := fmt.Sprintf("%s/auth/validate?token=%s", c.BaseURL, token)
	resp, err := c.HTTPClient.Get(url)
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
	url := fmt.Sprintf("%s/lobby/code", c.BaseURL)
	resp, err := c.HTTPClient.Get(url)
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
