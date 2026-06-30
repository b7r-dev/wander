import { useState } from "react";

interface Note {
  id: number;
  content: string;
  created_at: string;
}

interface RecentPayloadsProps {
  notes: Note[];
  onDelete: (id: number) => void;
  onGenerateQr: (id: number) => void;
  onLoad: (id: number) => void;
}

function timeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffDay > 0) return `${diffDay}d ago`;
  if (diffHour > 0) return `${diffHour}h ago`;
  if (diffMin > 0) return `${diffMin}m ago`;
  return "just now";
}

function truncate(str: string, maxLen: number): string {
  if (str.length <= maxLen) return str;
  return str.substring(0, maxLen).trimEnd() + "...";
}

export default function RecentPayloads({
  notes,
  onDelete,
  onGenerateQr,
  onLoad,
}: RecentPayloadsProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleDeleteClick = (id: number) => {
    setDeletingId(id);
  };

  const confirmDelete = (id: number) => {
    onDelete(id);
    setDeletingId(null);
  };

  const cancelDelete = () => {
    setDeletingId(null);
  };

  return (
    <div style={{ padding: "0 24px" }}>
      <div
        className="drawer-header"
        onClick={() => setIsExpanded(!isExpanded)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setIsExpanded(!isExpanded); }}
      >
        <span className={`drawer-chevron ${isExpanded ? "expanded" : ""}`}>▸</span>
        <span>Recent Payloads</span>
        <span className="drawer-count">{notes.length}</span>
      </div>

      {isExpanded && (
        <div className="drawer-body">
          {notes.length === 0 ? (
            <p style={{ color: "var(--muted)", fontSize: "13px", padding: "8px 0" }}>
              No payloads yet. Paste markdown above to create one.
            </p>
          ) : (
            <div style={{ maxHeight: "240px", overflowY: "auto" }}>
              {notes.map((note) => (
                <div key={note.id}>
                  {deletingId === note.id ? (
                    <div className="delete-inline">
                      <span className="delete-inline-text">
                        Delete this payload? This cannot be undone.
                      </span>
                      <button className="btn-ghost" onClick={cancelDelete}>
                        Cancel
                      </button>
                      <button className="btn-danger" onClick={() => confirmDelete(note.id)}>
                        Delete
                      </button>
                    </div>
                  ) : (
                    <div className="payload-row">
                      <div className="payload-meta">
                        <span className="payload-id">NOTE /{note.id}</span>
                        <span className="payload-preview">{truncate(note.content, 60)}</span>
                        <span className="payload-time">{timeAgo(note.created_at)}</span>
                      </div>
                      <div className="payload-actions">
                        <button
                          className="btn-compact"
                          onClick={() => onLoad(note.id)}
                          title="Load into editor"
                        >
                          Load
                        </button>
                        <button
                          className="btn-compact"
                          onClick={() => onGenerateQr(note.id)}
                          title="Show QR"
                        >
                          QR
                        </button>
                        <button
                          className="btn-ghost"
                          onClick={() => handleDeleteClick(note.id)}
                          title="Delete"
                          style={{ padding: "4px 8px" }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
