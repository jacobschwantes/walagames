package realtime


type Game interface {
	Run()
	HandleEvent(*Event)
}


