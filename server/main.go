package main

import (
	"embed"
	"fmt"
	"io/fs"
	"net/http"
	"os"
	"os/exec"
	"os/signal"
	"path/filepath"
	"strconv"
	"strings"
)

//go:embed all:dist
var content embed.FS

const daemonEnv = "__MODEL_HUB_DAEMON"

func pidFilePath() string {
	exe, _ := os.Executable()
	return exe + ".pid"
}

func logFilePath() string {
	exe, _ := os.Executable()
	return exe + ".log"
}

func readPID() (int, error) {
	data, err := os.ReadFile(pidFilePath())
	if err != nil {
		return 0, err
	}
	pid, err := strconv.Atoi(strings.TrimSpace(string(data)))
	if err != nil {
		return 0, err
	}
	return pid, nil
}

func writePID(pid int) error {
	return os.WriteFile(pidFilePath(), []byte(strconv.Itoa(pid)), 0644)
}

func removePID() {
	os.Remove(pidFilePath())
}

// isRunning checks if a process with the given PID is alive.
func isRunning(pid int) bool {
	return processAlive(pid)
}

func stopProcess() bool {
	pid, err := readPID()
	if err != nil {
		return false
	}
	if !isRunning(pid) {
		removePID()
		return false
	}
	proc, err := os.FindProcess(pid)
	if err != nil {
		removePID()
		return false
	}
	_ = proc.Signal(stopSignal())
	removePID()
	return true
}

func usage() {
	exe := filepath.Base(os.Args[0])
	fmt.Printf("Usage: %s [start|stop|restart] [--host HOST] [--port PORT] [-f]\n\n", exe)
	fmt.Println("Commands:")
	fmt.Println("  (none)     Start server in background (default)")
	fmt.Println("  start      Start server in background")
	fmt.Println("  stop       Stop running server")
	fmt.Println("  restart    Restart server in background")
	fmt.Println()
	fmt.Println("Options:")
	fmt.Println("  --host     Bind address (default: 0.0.0.0)")
	fmt.Println("  --port     Listen port  (default: 8000)")
	fmt.Println("  -f         Run in foreground")
}

func parseArgs() (command, host string, port int, foreground bool) {
	command = "start"
	host = "0.0.0.0"
	port = 8000
	foreground = false

	args := os.Args[1:]
	i := 0
	for i < len(args) {
		arg := args[i]
		switch {
		case arg == "start" || arg == "stop" || arg == "restart":
			command = arg
		case arg == "-f" || arg == "--foreground":
			foreground = true
		case arg == "--host" && i+1 < len(args):
			i++
			host = args[i]
		case strings.HasPrefix(arg, "--host="):
			host = arg[len("--host="):]
		case arg == "--port" && i+1 < len(args):
			i++
			p, err := strconv.Atoi(args[i])
			if err != nil {
				fmt.Printf("Error: invalid port %q\n", args[i])
				os.Exit(1)
			}
			port = p
		case strings.HasPrefix(arg, "--port="):
			p, err := strconv.Atoi(arg[len("--port="):])
			if err != nil {
				fmt.Printf("Error: invalid port %q\n", arg[len("--port="):])
				os.Exit(1)
			}
			port = p
		case arg == "-h" || arg == "--help":
			usage()
			os.Exit(0)
		default:
			fmt.Printf("Error: unknown argument %q\n", arg)
			usage()
			os.Exit(1)
		}
		i++
	}
	return
}

// daemonize re-executes the current process in the background.
func daemonize() {
	exe, err := os.Executable()
	if err != nil {
		fmt.Printf("Error: %v\n", err)
		os.Exit(1)
	}

	logFile, err := os.OpenFile(logFilePath(), os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0644)
	if err != nil {
		fmt.Printf("Error: failed to open log file: %v\n", err)
		os.Exit(1)
	}

	// Pass all original args, ensure -f is added so the child runs in foreground
	args := append(os.Args[1:], "-f")

	cmd := exec.Command(exe, args...)
	cmd.Stdout = logFile
	cmd.Stderr = logFile
	setSysProcAttr(cmd)

	if err := cmd.Start(); err != nil {
		fmt.Printf("Error: failed to start daemon: %v\n", err)
		os.Exit(1)
	}

	fmt.Printf("Datatist Model Hub Client started (PID %d), log: %s\n", cmd.Process.Pid, logFilePath())
}

func serve(host string, port int) {
	// Check if already running
	if pid, err := readPID(); err == nil && isRunning(pid) {
		fmt.Printf("Error: server is already running (PID %d)\n", pid)
		os.Exit(1)
	}

	sub, err := fs.Sub(content, "dist")
	if err != nil {
		fmt.Printf("Error: failed to locate embedded assets: %v\n", err)
		os.Exit(1)
	}

	fileServer := http.FileServer(http.FS(sub))

	handler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		path := r.URL.Path
		if path != "/" {
			if _, err := fs.Stat(sub, path[1:]); err != nil {
				r.URL.Path = "/"
			}
		}
		fileServer.ServeHTTP(w, r)
	})

	addr := fmt.Sprintf("%s:%d", host, port)
	server := &http.Server{Addr: addr, Handler: handler}

	// Write PID file
	if err := writePID(os.Getpid()); err != nil {
		fmt.Printf("Error: failed to write PID file: %v\n", err)
		os.Exit(1)
	}

	go func() {
		sig := make(chan os.Signal, 1)
		signal.Notify(sig, os.Interrupt, stopSignal())
		<-sig
		fmt.Println("\nShutting down...")
		removePID()
		server.Close()
	}()

	fmt.Printf("Datatist Model Hub Client running at http://%s\n", addr)
	if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
		removePID()
		fmt.Printf("Error: %v\n", err)
		os.Exit(1)
	}
}

func main() {
	command, host, port, foreground := parseArgs()

	switch command {
	case "start":
		if foreground {
			serve(host, port)
		} else {
			daemonize()
		}
	case "stop":
		if stopProcess() {
			fmt.Println("Server stopped.")
		} else {
			fmt.Println("Server is not running.")
		}
	case "restart":
		if stopProcess() {
			fmt.Println("Server stopped, restarting...")
		}
		if foreground {
			serve(host, port)
		} else {
			daemonize()
		}
	}
}
