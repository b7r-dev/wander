import { notFound } from "next/navigation";
import { getNote } from "@/lib/db";
import EditPageClient from "./EditPageClient";

interface EditPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditPage({ params }: EditPageProps) {
  const { id } = await params;
  const noteId = parseInt(id, 10);

  if (isNaN(noteId)) {
    notFound();
  }

  const note = getNote(noteId);

  if (!note) {
    notFound();
  }

  return <EditPageClient noteId={noteId} initialContent={note.content} />;
}
