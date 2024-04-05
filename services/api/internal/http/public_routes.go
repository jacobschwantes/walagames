package http

import (
	"encoding/json"
	"fmt"
	"log"
	"math"
	"net/http"
	"os"
	"path/filepath"

	"github.com/ip2location/ip2location-go/v9"
	api "github.com/jacobschwantes/quizblitz/services/api/internal"
)

func ipHandler() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", os.Getenv("CORS_ORIGIN"))
		w.Header().Set("Access-Control-Allow-Methods", "GET, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

		switch r.Method {
		case http.MethodOptions:
			w.WriteHeader(http.StatusOK)
		case http.MethodGet:
			ip := r.RemoteAddr

			lat, long, err := ipToCoordinates(ip)
			if err != nil {
				log.Fatal(err)
				http.Error(w, "Failed to get coordinates.", http.StatusInternalServerError)
				return
			}

			dist := haversineDistance(44.977753, -93.265015, lat, long)

			fmt.Println(dist)

			w.WriteHeader(http.StatusOK)
			w.Write([]byte(fmt.Sprintf("lat: %f, long: %f, dist: %f", lat, long, dist)))
		default:
			http.Error(w, "Method not allowed.", http.StatusMethodNotAllowed)
		}
	}
}

const earthRadius = 6371 // Earth's radius in kilometers

// haversineDistance calculates the distance between two points on the Earth
// given their latitude and longitude in degrees.
func haversineDistance(lat1, lon1, lat2, lon2 float64) float64 {
	// Convert latitude and longitude from degrees to radians
	lat1Rad := lat1 * math.Pi / 180
	lon1Rad := lon1 * math.Pi / 180
	lat2Rad := lat2 * math.Pi / 180
	lon2Rad := lon2 * math.Pi / 180

	// Haversine formula
	dLat := lat2Rad - lat1Rad
	dLon := lon2Rad - lon1Rad
	a := math.Sin(dLat/2)*math.Sin(dLat/2) +
		math.Cos(lat1Rad)*math.Cos(lat2Rad)*
			math.Sin(dLon/2)*math.Sin(dLon/2)
	c := 2 * math.Atan2(math.Sqrt(a), math.Sqrt(1-a))

	distance := earthRadius * c

	return distance
}

func ipToCoordinates(ip string) (lat float64, long float64, err error) {
	cwd, err := os.Getwd()
	if err != nil {
		fmt.Println("Error getting current working directory:", err)
		return
	}

	// Join the directory path with the filename
	filename := "IP2LOCATION-LITE-DB11.BIN"
	filepath := filepath.Join(cwd, filename)

	db, err := ip2location.OpenDB(filepath)
	if err != nil {
		fmt.Println("failed to open geo location db")
		return 0, 0, err
	}
	defer db.Close()
	fmt.Println(ip)
	results, err := db.Get_all(ip)
	if err != nil {
		fmt.Println("failed to get geo location")
		return 0, 0, err
	}

	lat = float64(results.Latitude)
	long = float64(results.Longitude)

	return lat, long, nil
}

// todo: refactor this
func lobbyJoinHandler(lobbyService api.LobbyService) http.HandlerFunc {
	type lobbyJoinRequest struct {
		Code string `json:"code"`
	}
	type lobbyJoinResponse struct {
		Code   string `json:"code"`
		Server string `json:"server"`
		Meta   struct {
			MaxPlayers int `json:"max_players"`
		} `json:"meta"`
		Token string `json:"token,omitempty"`
	}

	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", os.Getenv("CORS_ORIGIN"))
		w.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Authorization, Content-Type")

		switch r.Method {
		case http.MethodOptions:
			w.WriteHeader(http.StatusOK)
		case http.MethodPost:
			authToken := r.Context().Value(authTokenContextKey).(string)
			lobbyCode := r.PathValue("code")
			if lobbyCode == "" {
				http.Error(w, "Lobby code is required.", http.StatusBadRequest)
				return
			}

			lobbyData, err := lobbyService.GetLobbyState(r.Context(), lobbyCode)
			if err != nil {
				log.Fatal(err)
				http.Error(w, "Failed to get lobby data.", http.StatusInternalServerError)
				return
			}

			resp := &lobbyJoinResponse{
				Code:   lobbyData.Code,
				Server: lobbyData.HostServer,
				Meta: struct {
					MaxPlayers int `json:"max_players"`
				}{
					MaxPlayers: lobbyData.MaxPlayers,
				},
			}

			if authToken != "" {
				// if users are authenticated, we return the token issued from the middleware
				resp.Token = authToken
			}

			jsonData, err := json.Marshal(resp)
			if err != nil {
				log.Fatal(err)
				http.Error(w, "Failed to marshal lobby data.", http.StatusInternalServerError)
				return
			}

			w.WriteHeader(http.StatusOK)
			w.Write(jsonData)
		default:
			http.Error(w, "Method not allowed.", http.StatusMethodNotAllowed)
		}
	}
}

func lobbyHostHandler() http.HandlerFunc {
	type lobbyHostResponse struct {
		Token  string `json:"token"`
		Server string `json:"server"`
	}
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", os.Getenv("CORS_ORIGIN"))
		w.Header().Set("Access-Control-Allow-Methods", "GET, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Authorization")
		w.Header().Set("Content-Type", "application/json")

		switch r.Method {
		case http.MethodOptions:
			w.WriteHeader(http.StatusOK)
		case http.MethodPost:
			authToken := r.Context().Value(authTokenContextKey).(string)
			// TODO: use geolocation to route to one of our servers in the pool
			srvAddr := "localhost:8081"

			resp := &lobbyHostResponse{
				Token:  authToken,
				Server: srvAddr,
			}

			jsonData, err := json.Marshal(resp)
			if err != nil {
				log.Fatal(err)
				http.Error(w, "Failed to marshal lobby host response.", http.StatusInternalServerError)
				return
			}

			w.WriteHeader(http.StatusOK)
			w.Write(jsonData)
		default:
			http.Error(w, "Method not allowed.", http.StatusMethodNotAllowed)
			return
		}
	}
}

func setsHandler(setService api.SetService) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", os.Getenv("CORS_ORIGIN"))
		w.Header().Set("Access-Control-Allow-Methods", "GET, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

		switch r.Method {
		case http.MethodOptions:
			w.WriteHeader(http.StatusOK)
		case http.MethodGet:
			user := r.Context().Value(userContextKey).(*api.User)
			sets, err := setService.Sets(string(user.ID))
			if err != nil {
				log.Fatal(err)
				http.Error(w, "Failed to get sets.", http.StatusInternalServerError)
				return
			}

			jsonData, err := json.Marshal(sets)
			if err != nil {
				log.Fatal(err)
				http.Error(w, "Failed to marshal sets.", http.StatusInternalServerError)
				return
			}

			w.WriteHeader(http.StatusOK)
			w.Write(jsonData)
		default:
			http.Error(w, "Method not allowed.", http.StatusMethodNotAllowed)
		}
	}
}

func setHandler(setService api.SetService) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", os.Getenv("CORS_ORIGIN"))
		w.Header().Set("Access-Control-Allow-Methods", "GET, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

		switch r.Method {
		case http.MethodOptions:
			w.WriteHeader(http.StatusOK)
		case http.MethodGet:
			setID := r.URL.Query().Get("id")
			set, err := setService.Set(setID)
			if err != nil {
				log.Fatal(err)
				http.Error(w, "Failed to get set.", http.StatusInternalServerError)
				return
			}

			jsonData, err := json.Marshal(set)
			if err != nil {
				log.Fatal(err)
				http.Error(w, "Failed to marshal set.", http.StatusInternalServerError)
				return
			}

			w.WriteHeader(http.StatusOK)
			w.Write(jsonData)
		case http.MethodPost:
			var set api.Set
			if err := json.NewDecoder(r.Body).Decode(&set); err != nil {
				log.Fatal(err)
				http.Error(w, "Failed to decode set.", http.StatusBadRequest)
				return
			}

			user := r.Context().Value(userContextKey).(*api.User)
			set.OwnerID = user.ID

			err := setService.CreateSet(set)
			if err != nil {
				log.Fatal(err)
				http.Error(w, "Failed to create set.", http.StatusInternalServerError)
				return
			}

			w.WriteHeader(http.StatusCreated)
		default:
			http.Error(w, "Method not allowed.", http.StatusMethodNotAllowed)
		}
	}
}
