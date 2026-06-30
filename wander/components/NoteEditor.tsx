"use client";

import React, { useState } from "react";

interface NoteEditorProps {
  initialContent?: string;
  onSave: (content: string) => void;
  onCancel?: () => void;
  saveLabel?: string;
}

export default function NoteEditor({
  initialContent = "",
  onSave,
  onCancel,
  saveLabel = "Save",
}: NoteEditorProps) {
  const [content, setContent] = useState(initialContent);

  const handleSave = () => {
    if (content.trim()) {
      onSave(content);
    }
  };

  return (
    <div className="space-y-3">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Paste your markdown here..."
        className="w-full h-64 p-4 bg-gray-900 border border-gray-700 rounded-lg text-gray-100 font-mono text-base resize-y focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
      <div className="flex gap-3">
        <button
          onClick={handleSave}
          disabled={!content.trim()}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded-lg font-medium transition-colors"
        >
          {saveLabel}
        </button>
        {onCancel && (
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg font-medium transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}
