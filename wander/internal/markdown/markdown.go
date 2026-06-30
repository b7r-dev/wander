package markdown

import (
	"bytes"

	chromaHtml "github.com/alecthomas/chroma/v2/formatters/html"
	"github.com/alecthomas/chroma/v2/styles"
	"github.com/yuin/goldmark"
	highlighting "github.com/yuin/goldmark-highlighting/v2"
	"github.com/yuin/goldmark/extension"
	"github.com/yuin/goldmark/renderer/html"
)

var md goldmark.Markdown

func init() {
	md = goldmark.New(
		goldmark.WithExtensions(
			extension.GFM,
			highlighting.NewHighlighting(
				highlighting.WithStyle("vsc-dark-plus"),
				highlighting.WithFormatOptions(
					chromaHtml.WithLineNumbers(false),
					chromaHtml.WithPreWrapper(&preWrap{}),
				),
			),
		),
		goldmark.WithRendererOptions(
			html.WithHardWraps(),
			html.WithXHTML(),
		),
	)
}

type preWrap struct{}

func (p *preWrap) Start(code bool, styleAttr string) string {
	return "<pre><code>"
}

func (p *preWrap) End(code bool) string {
	return "</code></pre>"
}

func Render(content string) (string, error) {
	var buf bytes.Buffer
	if err := md.Convert([]byte(content), &buf); err != nil {
		return "", err
	}
	return buf.String(), nil
}

func GetStyleCSS() string {
	style := styles.Get("vsc-dark-plus")
	if style == nil {
		style = styles.Fallback
	}
	var buf bytes.Buffer
	formatters := chromaHtml.New(chromaHtml.WithClasses(true))
	if err := formatters.WriteCSS(&buf, style); err != nil {
		return ""
	}
	return buf.String()
}
