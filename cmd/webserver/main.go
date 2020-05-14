package main

import (
	"flag"
	"fmt"
	"net/http"
)

func main() {

	var cliArguments = handleCliArguments()

	// start simple static file server
	http.Handle("/", http.FileServer(http.Dir(cliArguments.dir)))

	http.ListenAndServe(fmt.Sprintf(":%s", cliArguments.port), nil)
}

// all expected cli arguments as return type
type cliArguments struct {
	port string
	dir  string
}

// parse the cli arguments
func handleCliArguments() (out cliArguments) {
	port := flag.String("p", "80", "use this port for the web server")
	dir := flag.String("d", "/", "use this directory as base for the web server")
	flag.Parse()
	out.port = *port
	out.dir = *dir

	return out
}
