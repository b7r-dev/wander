"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Note } from "@/lib/db";

interface NoteListProps {
  notes: Note[];
  onDelete: (id: number) => void;
  onGenerateQr: (id: number) => void;
}

function timeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
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
  return str.substring(0, maxLen) + "...";
}

export default function NoteList({
  notes,
  onDelete,
  onGenerateQr,
}: NoteListProps) {
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleDelete = (id: number) => {
    setDeletingId(id);
  };

  const confirmDelete = (id: number) => {
    onDelete(id);
    setDeletingId(null);
  };

  const cancelDelete = () => {
    setDeletingId(null);
  };

  if (notes.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        No notes yet. Paste some markdown above to get started.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {notes.map((note) => (
        <div
          key={note.id}
          className="flex items-center justify-between p-3 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 transition-colors"
        >
          <div className="flex-1 min-w-0 mr-4">
            <p className="text-gray-200 text-sm truncate">
              {truncate(note.content, 80)}
            </p>
            <p
              className="text-gray-500 text-xs mt-1"
              title={new Date(note.created_at).toISOString()}
            >
              {timeAgo(note.created_at)}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {deletingId === note.id ? (
              <>
                <button
                  onClick={() => confirmDelete(note.id)}
                  className="px-2 py-1 bg-red-600 hover:bg-red-500 text-white text-xs rounded transition-colors"
                >
                  Confirm
                </button>
                <button
                  onClick={cancelDelete}
                  className="px-2 py-1 bg-gray-600 hover:bg-gray-500 text-white text-xs rounded transition-colors"
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <Link
                  href={`/note/${note.id}`}
                  target="_blank"
                  className="px-2 py-1 bg-gray-700 hover:bg-gray-600 text-gray-200 text-xs rounded transition-colors"
                >
                  View
                </Link>
                <Link
                  href={`/edit/${note.id}`}
                  className="px-2 py-1 bg-gray-700 hover:bg-gray-600 text-gray-200 text-xs rounded transition-colors"
                >
                  Edit
                </Link>
                <button
                  onClick={() => onGenerateQr(note.id)}
                  className="px-2 py-1 bg-blue-700 hover:bg-blue-600 text-white text-xs rounded transition-colors"
                >
                  QR
                </button>
                <button
                  onClick={() => handleDelete(note.id)}
                  className="px-2 py-1 bg-red-700 hover:bg-red-600 text-white text-xs rounded transition-colors"
                >
                  Delete
                </button>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
