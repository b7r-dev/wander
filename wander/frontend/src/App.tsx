import { useState, useEffect, useCallback } from "react";
import NoteEditor from "./components/NoteEditor";
import NoteList from "./components/NoteList";
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
      console.error("Failed to update note:", err);
      alert("Failed to save note.");
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

  const handleEdit = async (id: number) => {
    if (!app) return;
    const note = await app.GetNote(id);
    if (note) {
      setEditingNote(note);
    }
  };

  const handleCancelEdit = () => {
    setEditingNote(null);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Wander</h1>
        <p className="text-gray-400">
          Paste markdown, generate a QR code, and read it on your phone.
        </p>
      </div>

      {/* Editor + QR Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Editor */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              LAN Base URL
            </label>
            <input
              type="text"
              value={lanBaseUrl}
              onChange={(e) => setLanBaseUrl(e.target.value)}
              className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-gray-100 text-base font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="http://192.168.1.x:3030"
            />
            <p className="text-gray-500 text-xs mt-1">
              Auto-detected. Override if needed for your network.
            </p>
          </div>

          {editingNote ? (
            <div>
              <h2 className="text-lg font-semibold text-white mb-3">Edit Note</h2>
              <NoteEditor
                initialContent={editingNote.content}
                onSave={handleUpdate}
                onCancel={handleCancelEdit}
                saveLabel={isGenerating ? "Saving..." : "Save Changes"}
              />
            </div>
          ) : (
            <NoteEditor
              onSave={handleSave}
              saveLabel={isGenerating ? "Generating..." : "Generate QR & Save"}
            />
          )}
        </div>

        {/* Right: QR Display */}
        <div>
          {qrData ? (
            <QrPanel qrDataUrl={qrData.qrDataUrl} fullUrl={qrData.fullUrl} />
          ) : (
            <div className="flex items-center justify-center h-full min-h-[300px] bg-gray-800 border border-gray-700 border-dashed rounded-lg">
              <p className="text-gray-500 text-center">
                QR code will appear here
                <br />
                <span className="text-sm">Paste markdown and click Generate</span>
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Notes List */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-4">Your Notes</h2>
        <NoteList
          notes={notes}
          onDelete={handleDelete}
          onGenerateQr={handleGenerateQr}
          onEdit={handleEdit}
        />
      </div>
    </div>
  );
}

export default App;
