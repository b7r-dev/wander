"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import NoteEditor from "@/components/NoteEditor";
import { updateNoteAction } from "@/app/actions";

interface EditPageClientProps {
  noteId: number;
  initialContent: string;
}

export default function EditPageClient({
  noteId,
  initialContent,
}: EditPageClientProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (content: string) => {
    setIsSaving(true);
    try {
      await updateNoteAction(noteId, content);
      router.push("/");
    } catch (err) {
      console.error("Failed to update note:", err);
      alert("Failed to save note.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    router.push("/");
  };

  return (
    <main className="min-h-screen bg-gray-950 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-6">Edit Note</h1>
        <NoteEditor
          initialContent={initialContent}
          onSave={handleSave}
          onCancel={handleCancel}
          saveLabel={isSaving ? "Saving..." : "Save Changes"}
        />
      </div>
    </main>
  );
}
