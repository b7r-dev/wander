package port

import (
	"fmt"
	"net"
)

const DefaultPort = 3030

func FindAvailablePort(start int) (int, error) {
	for port := start; port < 65535; port++ {
		ln, err := net.Listen("tcp", fmt.Sprintf(":%d", port))
		if err == nil {
			ln.Close()
			return port, nil
		}
	}
	return 0, fmt.Errorf("no available port found")
}
