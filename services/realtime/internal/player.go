package realtime

type PlayerRole string

const (
	RoleHost   PlayerRole = "HOST"
	RolePlayer PlayerRole = "PLAYER"
)

type PlayerStatus string

const (
	StatusJoining      PlayerStatus = "JOINING"
	StatusConnected    PlayerStatus = "CONNECTED"
	StatusDisconnected PlayerStatus = "DISCONNECTED"
	StatusKicked       PlayerStatus = "KICKED"
)

type Player struct {
	ID       string       `json:"id"`
	Role     PlayerRole   `json:"role"`
	Username string       `json:"username"`
	Image    string       `json:"image"`
	Client   Client       `json:"-"`
	Status   PlayerStatus `json:"status"`
}
