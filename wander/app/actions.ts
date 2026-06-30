"use server";

import { createNote, getNote, getAllNotes, updateNote, deleteNote } from "@/lib/db";
import { getLanUrl } from "@/lib/lan";
import QRCode from "qrcode";

export async function generateNoteAndQr(content: string, lanBaseUrl: string) {
  try {
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
  } catch (err: any) {
    console.error("[generateNoteAndQr] Error:", err.message, err.stack);
    throw new Error(`Failed to generate QR: ${err.message}`);
  }
}

export async function generateQrForNote(noteId: number, lanBaseUrl: string) {
  try {
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
  } catch (err: any) {
    console.error("[generateQrForNote] Error:", err.message, err.stack);
    throw new Error(`Failed to generate QR: ${err.message}`);
  }
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
