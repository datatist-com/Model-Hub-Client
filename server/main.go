package main

import (
	"embed"
	"flag"
	"fmt"
	"io/fs"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
)

//go:embed all:dist
var content embed.FS

func main() {
	port := flag.Int("port", 8080, "listening port")
	flag.Parse()

	sub, err := fs.Sub(content, "dist")
	if err != nil {
		log.Fatalf("failed to locate embedded dist: %v", err)
	}

	fileServer := http.FileServer(http.FS(sub))

	handler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Try the requested path first; fall back to index.html for SPA routing.
		path := r.URL.Path
		if path != "/" {
			if _, err := fs.Stat(sub, path[1:]); err != nil {
				r.URL.Path = "/"
			}
		}
		fileServer.ServeHTTP(w, r)
	})

	addr := fmt.Sprintf(":%d", *port)
	server := &http.Server{Addr: addr, Handler: handler}

	go func() {
		sig := make(chan os.Signal, 1)
		signal.Notify(sig, syscall.SIGINT, syscall.SIGTERM)
		<-sig
		fmt.Println("\nshutting down…")
		server.Close()
	}()

	fmt.Printf("Datatist Model Hub Client running at http://localhost%s\n", addr)
	if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
		log.Fatal(err)
	}
}
