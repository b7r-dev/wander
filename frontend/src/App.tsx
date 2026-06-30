import { useState, useEffect, useCallback } from "react";
import NoteEditor from "./components/NoteEditor";
import RecentPayloads from "./components/RecentPayloads";
import QrPanel from "./components/QrPanel";

interface Note {
  id: number;
  content: string;
  created_at: string;
}

function App() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [qrData, setQrData] = useState<{ qrDataUrl: string; fullUrl: string } | null>(null);
  const [lanBaseUrl, setLanBaseUrl] = useState("http://localhost:3030");
  const [isLanEditing, setIsLanEditing] = useState(false);
  const [lanInput, setLanInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);

  const app = (window as any).go?.main?.App;

  const refreshNotes = useCallback(async () => {
    if (!app) return;
    const updated = await app.GetNotes();
    setNotes(updated || []);
  }, [app]);

  useEffect(() => {
    if (!app) return;
    app.GetAutoLanIP().then((ip: string) => {
      setLanBaseUrl(`http://${ip}:3030`);
    });
    refreshNotes();
  }, [app, refreshNotes]);

  const handleSave = async (content: string) => {
    if (!app) return;
    setIsGenerating(true);
    try {
      const result = await app.CreateNote(content, lanBaseUrl);
      setQrData({
        qrDataUrl: result.qrDataUrl,
        fullUrl: result.fullUrl,
      });
      await refreshNotes();
      setEditingNote(null);
    } catch (err) {
      console.error("Failed to generate QR:", err);
      alert("Failed to generate QR code. Check the LAN URL.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUpdate = async (content: string) => {
    if (!app || !editingNote) return;
    setIsGenerating(true);
    try {
      await app.UpdateNote(editingNote.id, content);
      await refreshNotes();
      setEditingNote(null);
    } catch (err) {
      console.error("Failed to update payload:", err);
      alert("Failed to save payload.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateQr = async (id: number) => {
    if (!app) return;
    setIsGenerating(true);
    try {
      const result = await app.GenerateQR(id, lanBaseUrl);
      setQrData({
        qrDataUrl: result.qrDataUrl,
        fullUrl: result.fullUrl,
      });
    } catch (err) {
      console.error("Failed to generate QR:", err);
      alert("Failed to generate QR code.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!app) return;
    await app.DeleteNote(id);
    await refreshNotes();
    if (qrData && qrData.fullUrl.includes(`/note/${id}`)) {
      setQrData(null);
    }
  };

  const handleLoad = async (id: number) => {
    if (!app) return;
    const note = await app.GetNote(id);
    if (note) {
      setEditingNote(note);
    }
  };

  const handleClear = () => {
    setEditingNote(null);
  };

  const handleLanEdit = () => {
    setLanInput(lanBaseUrl);
    setIsLanEditing(true);
  };

  const handleLanApply = () => {
    if (lanInput.trim()) {
      setLanBaseUrl(lanInput.trim());
    }
    setIsLanEditing(false);
  };

  const handleLanReset = () => {
    if (!app) return;
    app.GetAutoLanIP().then((ip: string) => {
      setLanBaseUrl(`http://${ip}:3030`);
    });
    setIsLanEditing(false);
  };

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: "var(--bg)" }}>
      {/* Header */}
      <header style={{
        padding: "16px 24px",
        borderBottom: "1px solid var(--border)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexShrink: 0,
      }}>
        <div>
          <h1 style={{ margin: 0, lineHeight: 1.2 }}>Wander</h1>
          <p style={{ margin: "4px 0 0", color: "var(--muted)", fontSize: "13px" }}>
            Paste markdown. Scan it. Read it on your phone.
          </p>
        </div>

        {/* LAN Status Strip */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "6px" }}>
          {!isLanEditing ? (
            <div className="lan-strip">
              <div className="lan-status-dot" />
              <span style={{ color: "var(--muted)", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                LAN Ready
              </span>
              <span className="lan-url">{lanBaseUrl}</span>
              <span style={{ color: "var(--muted)", fontSize: "11px" }}>Auto-detected</span>
              <button className="btn-ghost" onClick={handleLanEdit} style={{ padding: "2px 8px", fontSize: "11px" }}>
                Edit
              </button>
            </div>
          ) : (
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px 14px",
              background: "var(--field)",
              border: "1px solid var(--border)",
              borderRadius: "4px",
            }}>
              <span style={{ color: "var(--label)", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                LAN Base URL
              </span>
              <input
                type="text"
                value={lanInput}
                onChange={(e) => setLanInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleLanApply(); }}
                style={{
                  background: "var(--field-deep)",
                  border: "1px solid var(--border)",
                  borderRadius: "3px",
                  padding: "4px 8px",
                  color: "var(--beige)",
                  fontSize: "12px",
                  fontFamily: "monospace",
                  width: "240px",
                  outline: "none",
                }}
                autoFocus
              />
              <button className="btn-compact" onClick={handleLanApply}>Apply</button>
              <button className="btn-ghost" onClick={handleLanReset} style={{ padding: "4px 10px", fontSize: "11px" }}>
                Reset Auto
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main style={{
        flex: 1,
        display: "flex",
        gap: "20px",
        padding: "20px 24px",
        overflow: "auto",
        minHeight: 0,
      }}>
        {/* Editor Pane */}
        <div className="editor-pane">
          <div style={{ marginBottom: "12px" }}>
            <span className="section-label">
              {editingNote ? "SOURCE MARKDOWN — EDITING PAYLOAD" : "SOURCE MARKDOWN"}
            </span>
            {editingNote && (
              <span style={{ color: "var(--beige)", fontSize: "12px", marginLeft: "12px" }}>
                NOTE /{editingNote.id}
              </span>
            )}
          </div>

          <NoteEditor
            key={editingNote?.id ?? "new"}
            initialContent={editingNote?.content ?? ""}
            onSave={editingNote ? handleUpdate : handleSave}
            onClear={editingNote ? handleClear : undefined}
            saveLabel={isGenerating ? "Saving..." : editingNote ? "Save Payload" : "Save Payload"}
            clearLabel={editingNote ? "Revert" : "Clear"}
          />
        </div>

        {/* Handoff Pane */}
        <div className="handoff-pane">
          <div style={{ marginBottom: "12px" }}>
            <span className="section-label">PHONE HANDOFF</span>
          </div>

          {qrData ? (
            <QrPanel qrDataUrl={qrData.qrDataUrl} fullUrl={qrData.fullUrl} />
          ) : (
            <div style={{
              background: "var(--panel)",
              border: "1px solid var(--border)",
              borderRadius: "6px",
              padding: "24px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "12px",
              minHeight: "280px",
            }}>
              <div style={{
                width: "120px",
                height: "120px",
                border: "2px dashed var(--border)",
                borderRadius: "4px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--beige-dim)" strokeWidth="1.5">
                  <rect x="3" y="3" width="7" height="7" rx="1" />
                  <rect x="14" y="3" width="7" height="7" rx="1" />
                  <rect x="3" y="14" width="7" height="7" rx="1" />
                  <rect x="14" y="14" width="7" height="7" rx="1" />
                </svg>
              </div>
              <p style={{ color: "var(--muted)", fontSize: "13px", textAlign: "center", margin: 0 }}>
                Paste markdown and save to generate a QR code
              </p>
              <div className="status-readout">
                <div className="status-dot idle" />
                <span>Waiting for payload</span>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Recent Payloads Drawer */}
      <div style={{ flexShrink: 0, borderTop: "1px solid var(--border)" }}>
        <RecentPayloads
          notes={notes}
          onDelete={handleDelete}
          onGenerateQr={handleGenerateQr}
          onLoad={handleLoad}
        />
      </div>
    </div>
  );
}

export default App;
