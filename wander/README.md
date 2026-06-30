# Wander

> Paste markdown, generate a QR code, read it on your phone while you wander around.

Wander is a tiny local app for copying text you need to read — meeting notes, documentation, recipes, anything — and instantly making it available on your phone via a QR code. No cloud, no auth, no accounts. Just your laptop and your phone on the same Wi-Fi.

---

## What It Does

1. **Paste markdown** into the web UI on your computer.
2. **Click "Generate QR & Save"** — a QR code appears.
3. **Scan the QR with your phone** — it opens a clean, beautifully rendered page on your local network.
4. **Wander away** and read it. That's it.

Notes are stored in a local SQLite database so they stick around, but they're ephemeral by design — no sync, no backup, no stress.

---

## Screenshot

*(Add a screenshot of the main dashboard and a phone view here)*

---

## Quick Start

```bash
# Clone the repo
git clone <repo-url> wander
cd wander

# Install dependencies
npm install

# Start the dev server (auto-detects LAN IP, default port 3030)
npm run dev
```

Open `http://localhost:3030` in your browser. The dashboard will show your auto-detected LAN address — you can override it if your network setup is unusual.

---

## How It Works

### LAN Access
Wander auto-detects your machine's local network IP (e.g., `192.168.1.x`) and constructs the QR code URL as `http://<ip>:3030/note/<id>`. The editable LAN base URL field lets you override this if you're on a VPN or the auto-detect picks the wrong interface.

### No Authentication
The `/note/[id]` route is public by design. Anyone on your local network can scan the QR and read the note. There is no auth layer — this is intentional for the "wander around" use case.

### Port Handling
The dev script (`scripts/dev.js`) starts at port **3030** and automatically increments if the port is taken. The actual port is passed to Next.js via the `PORT` environment variable.

---

## Features

- **Full GitHub Flavored Markdown** — tables, strikethrough, task lists, footnotes, autolinks
- **Syntax highlighting** — code blocks rendered with Prism (vscDarkPlus theme)
- **QR code generation** — server-side, instant, plain black-and-white
- **Note management** — create, edit, delete, regenerate QR for existing notes
- **Relative timestamps** — notes show "2h ago", "3d ago", etc.
- **Dark mode** — easy on the eyes, phone-friendly
- **SQLite persistence** — notes survive restarts but aren't precious

---

## Tech Stack

| Layer | Tech |
|-------|------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + `@tailwindcss/typography` |
| Database | SQLite via `better-sqlite3` |
| QR Codes | `qrcode` (server-side Data URLs) |
| Markdown | `react-markdown` + `remark-gfm` |
| Syntax Highlighting | `react-syntax-highlighter` (Prism) |

---

## Project Structure

```
wander/
├── app/
│   ├── page.tsx              # Dashboard (editor + note list)
│   ├── note/[id]/page.tsx   # Public GFM viewer
│   ├── edit/[id]/page.tsx   # Dedicated edit page
│   └── actions.ts           # Server Actions (CRUD + QR)
├── components/
│   ├── MarkdownRenderer.tsx  # GFM renderer with syntax highlighting
│   ├── NoteEditor.tsx        # Reusable markdown textarea
│   ├── NoteList.tsx          # Notes list with CRUD actions
│   └── QrPanel.tsx          # QR code display
├── lib/
│   ├── db.ts                # SQLite CRUD + schema init
│   ├── lan.ts               # LAN IP auto-detection
│   └── port-finder.ts       # findAvailablePort() utility
├── scripts/
│   └── dev.js               # Port finder + next dev launcher
├── data/
│   └── wander.db            # SQLite database (gitignored)
└── next.config.ts           # Next.js config (allowedDevOrigins for LAN)
```

---

## Database

SQLite file lives at `./data/wander.db`. It is created automatically on first run and is **gitignored**. Schema:

```sql
CREATE TABLE notes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  content TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

WAL mode is enabled for better concurrent read performance.

---

## Development

### Prerequisites

- Node.js 18+ (tested on 20+)
- npm

### Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start dev server with auto port detection |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |

### LAN Development

Next.js 16 blocks cross-origin HMR by default. The `next.config.ts` auto-adds your LAN IP to `allowedDevOrigins` so your phone can load the dev build. If you change networks, restart the dev server.

---

## Why SQLite?

SQLite keeps the architecture simple — no Docker, no external service, no connection pool. The database is just a file. It helps the app "just work" locally while keeping notes around between sessions. If the file gets lost, no big deal.

---

## License

MIT
