import { useState } from "react";

interface NoteEditorProps {
  initialContent?: string;
  onSave: (content: string) => void;
  onClear?: () => void;
  saveLabel?: string;
  clearLabel?: string;
}

export default function NoteEditor({
  initialContent = "",
  onSave,
  onClear,
  saveLabel = "Save Payload",
  clearLabel = "Clear",
}: NoteEditorProps) {
  const [content, setContent] = useState(initialContent);

  const handleSave = () => {
    if (content.trim()) {
      onSave(content);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      handleSave();
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Paste markdown here..."
        className="markdown-editor"
        spellCheck={false}
      />
      <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
        <button
          onClick={handleSave}
          disabled={!content.trim()}
          className="btn-primary"
        >
          {saveLabel}
        </button>
        {onClear && (
          <button onClick={onClear} className="btn-secondary">
            {clearLabel}
          </button>
        )}
        <span style={{ color: "var(--beige-dim)", fontSize: "11px", marginLeft: "auto" }}>
          {content.length > 0 ? `${content.length} chars` : ""}
        </span>
      </div>
    </div>
  );
}
