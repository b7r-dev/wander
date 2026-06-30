import { getAllNotes } from "@/lib/db";
import { getAutoLanIp } from "@/lib/lan";
import Dashboard from "./Dashboard";

export default async function Home() {
  const notes = getAllNotes();
  const lanIp = getAutoLanIp();
  const port = parseInt(process.env.PORT ?? "3420", 10);

  return (
    <main className="min-h-screen bg-gray-950">
      <Dashboard initialNotes={notes} initialLanIp={lanIp} port={port} />
    </main>
  );
}
