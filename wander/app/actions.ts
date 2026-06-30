"use server";

import { createNote, getNote, getAllNotes, updateNote, deleteNote } from "@/lib/db";
import { getLanUrl } from "@/lib/lan";
import QRCode from "qrcode";

export async function generateNoteAndQr(content: string, lanBaseUrl: string) {
  const note = createNote(content);
  
  // Extract IP and port from the base URL
  const url = new URL(lanBaseUrl);
  const ip = url.hostname;
  const port = parseInt(url.port, 10);
  
  const fullUrl = getLanUrl(ip, port, note.id);
  const qrDataUrl = await QRCode.toDataURL(fullUrl);
  
  return {
    noteId: note.id,
    qrDataUrl,
    fullUrl,
  };
}

export async function generateQrForNote(noteId: number, lanBaseUrl: string) {
  const note = getNote(noteId);
  if (!note) {
    throw new Error("Note not found");
  }
  
  const url = new URL(lanBaseUrl);
  const ip = url.hostname;
  const port = parseInt(url.port, 10);
  
  const fullUrl = getLanUrl(ip, port, noteId);
  const qrDataUrl = await QRCode.toDataURL(fullUrl);
  
  return {
    qrDataUrl,
    fullUrl,
  };
}

export async function deleteNoteAction(id: number) {
  deleteNote(id);
}

export async function getNotesAction() {
  return getAllNotes();
}

export async function getNoteAction(id: number) {
  return getNote(id);
}

export async function updateNoteAction(id: number, content: string) {
  updateNote(id, content);
}
