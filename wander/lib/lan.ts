import { networkInterfaces } from "os";

export function getAutoLanIp(): string | null {
  const interfaces = networkInterfaces();

  for (const name of Object.keys(interfaces)) {
    const iface = interfaces[name];
    if (!iface) continue;

    for (const addr of iface) {
      const familyV4Value = typeof addr.family === "string" ? "IPv4" : 4;
      if (addr.family === familyV4Value && !addr.internal) {
        return addr.address;
      }
    }
  }

  return null;
}

export function getLanUrl(ip: string, port: number, noteId: number): string {
  return `http://${ip}:${port}/note/${noteId}`;
}
