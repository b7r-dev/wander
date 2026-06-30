"use client";

import React, { useState, useEffect, useCallback } from "react";
import NoteEditor from "@/components/NoteEditor";
import NoteList from "@/components/NoteList";
import QrPanel from "@/components/QrPanel";
import {
  generateNoteAndQr,
  generateQrForNote,
  deleteNoteAction,
  getNotesAction,
} from "./actions";
import { Note } from "@/lib/db";
import { getAutoLanIp } from "@/lib/lan";

interface DashboardProps {
  initialNotes: Note[];
  initialLanIp: string | null;
  port: number;
}

export default function Dashboard({
  initialNotes,
  initialLanIp,
  port,
}: DashboardProps) {
  const [notes, setNotes] = useState<Note[]>(initialNotes);
  const [qrData, setQrData] = useState<{
    qrDataUrl: string;
    fullUrl: string;
  } | null>(null);
  const [lanBaseUrl, setLanBaseUrl] = useState(() => {
    const ip = initialLanIp ?? "localhost";
    return `http://${ip}:${port}`;
  });
  const [isGenerating, setIsGenerating] = useState(false);

  const refreshNotes = useCallback(async () => {
    const updated = await getNotesAction();
    setNotes(updated);
  }, []);

  const handleSave = async (content: string) => {
    setIsGenerating(true);
    try {
      const result = await generateNoteAndQr(content, lanBaseUrl);
      setQrData({
        qrDataUrl: result.qrDataUrl,
        fullUrl: result.fullUrl,
      });
      await refreshNotes();
    } catch (err) {
      console.error("Failed to generate QR:", err);
      alert("Failed to generate QR code. Check the LAN URL.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateQr = async (id: number) => {
    setIsGenerating(true);
    try {
      const result = await generateQrForNote(id, lanBaseUrl);
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
    await deleteNoteAction(id);
    await refreshNotes();
    // If the currently displayed QR is for this note, clear it
    if (qrData && qrData.fullUrl.includes(`/note/${id}`)) {
      setQrData(null);
    }
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
              placeholder="http://192.168.1.x:3420"
            />
            <p className="text-gray-500 text-xs mt-1">
              Auto-detected. Override if needed for your network.
            </p>
          </div>

          <NoteEditor
            onSave={handleSave}
            saveLabel={isGenerating ? "Generating..." : "Generate QR & Save"}
          />
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
        />
      </div>
    </div>
  );
}
