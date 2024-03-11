package realtime

type Set struct {
	ID            int
	OwnerID       int
	Collaborators []Collaborator
	Name          string
	Description   string
	ImageURL      string
	Tags          []SetTag
	Terms         []Term
}

type Collaborator struct {
	ID         int
	Permission CollaboratorPermission
}

type CollaboratorPermission string

const (
	PermissionRead      CollaboratorPermission = "read"
	PermissionAdmin     CollaboratorPermission = "admin"
	PermissionOwner     CollaboratorPermission = "owner"
	PermissionReadWrite CollaboratorPermission = "read_write"
)

type SetTag struct {
	ID  int
	Tag string
}

type Term struct {
	ID         int
	Term       string
	Definition string
	Tags       []TermTag
}

type TermTag struct {
	ID  int
	Tag string
}

type SetRepository interface {
	Set(id int) (*Set, error)
}
