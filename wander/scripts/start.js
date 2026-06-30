const { spawn } = require("child_process");
const { createServer } = require("net");

const DEFAULT_PORT = 3030;

function findAvailablePort(startPort) {
  return new Promise((resolve, reject) => {
    const server = createServer();

    server.on("error", (err) => {
      if (err.code === "EADDRINUSE") {
        server.close();
        findAvailablePort(startPort + 1)
          .then(resolve)
          .catch(reject);
      } else {
        reject(err);
      }
    });

    server.listen(startPort, () => {
      const address = server.address();
      const port =
        typeof address === "object" && address !== null
          ? address.port
          : startPort;
      server.close(() => {
        resolve(port);
      });
    });
  });
}

async function main() {
  // Respect explicit PORT env var, otherwise find starting at 3030
  const explicitPort = process.env.PORT ? parseInt(process.env.PORT, 10) : null;
  const port = explicitPort ?? (await findAvailablePort(DEFAULT_PORT));

  console.log(`Starting Wander on port ${port}`);

  const env = { ...process.env, PORT: String(port) };

  const child = spawn("npx", ["next", "start"], {
    stdio: "inherit",
    env,
  });

  child.on("exit", (code) => {
    process.exit(code ?? 0);
  });
}

main().catch((err) => {
  console.error("Failed to start Wander:", err);
  process.exit(1);
});
