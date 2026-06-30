package qr

import (
	"bytes"
	"encoding/base64"
	"fmt"
	"image/png"

	"github.com/skip2/go-qrcode"
)

func GenerateDataURL(url string) (string, error) {
	q, err := qrcode.New(url, qrcode.Medium)
	if err != nil {
		return "", err
	}
	img := q.Image(256)
	var buf bytes.Buffer
	if err := png.Encode(&buf, img); err != nil {
		return "", err
	}
	b64 := base64.StdEncoding.EncodeToString(buf.Bytes())
	return fmt.Sprintf("data:image/png;base64,%s", b64), nil
}
