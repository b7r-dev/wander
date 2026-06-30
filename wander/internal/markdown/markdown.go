package markdown

import (
	"bytes"
	"regexp"
	"strings"

	chromaHtml "github.com/alecthomas/chroma/v2/formatters/html"
	"github.com/alecthomas/chroma/v2/styles"
	"github.com/yuin/goldmark"
	highlighting "github.com/yuin/goldmark-highlighting/v2"
	"github.com/yuin/goldmark/extension"
	"github.com/yuin/goldmark/parser"
	"github.com/yuin/goldmark/renderer/html"
)

var md goldmark.Markdown

func init() {
	md = goldmark.New(
		goldmark.WithExtensions(
			extension.GFM,
			extension.DefinitionList,
			highlighting.NewHighlighting(
				highlighting.WithStyle("vsc-dark-plus"),
				highlighting.WithFormatOptions(
					chromaHtml.WithLineNumbers(false),
					chromaHtml.WithPreWrapper(&preWrap{}),
				),
			),
		),
		goldmark.WithParserOptions(
			parser.WithAutoHeadingID(),
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

// isTableRow checks if a line looks like a table row or separator.
func isTableRow(line string) bool {
	trimmed := strings.TrimSpace(line)
	if len(trimmed) < 2 {
		return false
	}
	if trimmed[0] != '|' {
		return false
	}
	lastPipe := strings.LastIndex(trimmed, "|")
	if lastPipe <= 0 {
		return false
	}
	return true
}

var blankLineBetweenTableRows = regexp.MustCompile(`(?m)(\|.*\|)\n\n(\|.*\|)`)

// normalizeTables removes blank lines between contiguous table rows
// so that goldmark's table parser can recognize them.
func normalizeTables(content string) string {
	for {
		next := blankLineBetweenTableRows.ReplaceAllString(content, "$1\n$2")
		if next == content {
			break
		}
		content = next
	}
	return content
}

func Render(content string) (string, error) {
	normalized := normalizeTables(content)
	var buf bytes.Buffer
	if err := md.Convert([]byte(normalized), &buf); err != nil {
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
