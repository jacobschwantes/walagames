package realtime

type Set struct {
	ID          int
	OwnerID     int
	Name        string
	Description string
	ImageURL    string
	Tags        []SetTag
	Terms       []Term
}

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
	GetSetByID(id int) (*Set, error)
}
