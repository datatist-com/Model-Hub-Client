//go:build windows

package main

import (
	"os"
	"os/exec"
)

func setSysProcAttr(_ *exec.Cmd) {
	// No Setsid equivalent needed on Windows; child process
	// is already detached when started without a console.
}

func stopSignal() os.Signal {
	return os.Kill
}

func processAlive(pid int) bool {
	proc, err := os.FindProcess(pid)
	if err != nil {
		return false
	}
	// On Windows, FindProcess always succeeds. Signal(0) is not
	// supported, so attempt to signal and check the error.
	err = proc.Signal(os.Signal(nil))
	return err != nil // if err is "not supported", process exists
}
