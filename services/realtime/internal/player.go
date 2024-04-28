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

type PlayerProfile struct {
	ID       string `json:"id"`
	Username string `json:"username"`
	Image    string `json:"image"`
}

type PlayerInfo struct {
	Status  PlayerStatus  `json:"status"`
	Role    PlayerRole    `json:"role"`
	Profile PlayerProfile `json:"profile"`
}

type Player interface {
	Status() PlayerStatus
	ChangeStatus(status PlayerStatus)
	Role() PlayerRole
	ChangeRole(r PlayerRole)
	ID() string
	Info() *PlayerInfo
}
