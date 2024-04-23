package api

import (
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"github.com/jacobschwantes/quizblitz/services/realtime/internal"
)

// TODO: implement standardized encoder, decoder
type apiClient struct {
	APIEndpoint string
	APIKey      string
	HTTPClient  *http.Client
}

func NewClient(APIEndpoint string, APIKey string) realtime.APIClient {
	return &apiClient{
		APIEndpoint: APIEndpoint,
		APIKey: APIKey,
		HTTPClient: &http.Client{
			Timeout: time.Second * 10,
		},
	}
}

func (c *apiClient) FetchQuiz(id string, userID string) (*realtime.Quiz, error) {
	url := fmt.Sprintf("%s/quiz/%s", c.APIEndpoint, id)

	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		fmt.Println("failed to create request for fetching quiz")
		return nil, err
	}

	req.Header.Set("Authorization", c.APIKey)
	req.Header.Set("X-User-ID", userID)

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
