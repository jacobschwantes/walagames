package apiclient

import (
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	api "github.com/jacobschwantes/quizblitz/services/api/internal"
)

type apiClient struct {
	APIEndpoint string
	APIKey      string
	HTTPClient  *http.Client
}

func New(APIEndpoint string, APIKey string) api.APIClient {
	return &apiClient{
		APIEndpoint: APIEndpoint,
		APIKey:      APIKey,
		HTTPClient: &http.Client{
			Timeout: time.Second * 10,
		},
	}
}

func (c *apiClient) GetUserData(userID string) (*api.User, error) {
	url := fmt.Sprintf("%s/api/user/%s", c.APIEndpoint, userID)

	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		fmt.Println("failed to create request for fetching quiz")
		return nil, err
	}

	req.Header.Set("Authorization", c.APIKey)

	resp, err := c.HTTPClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("API returned non-200 status code: %d", resp.StatusCode)
	}

	type response struct {
		User api.User `json:"user"`
	}

	var res response
	if err := json.NewDecoder(resp.Body).Decode(&res); err != nil {
		return nil, err
	}

	// log.Println(res)

	return &res.User, nil
}
