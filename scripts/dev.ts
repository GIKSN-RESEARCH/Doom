import { spawn, type ChildProcess } from "node:child_process";
import { watchFile, unwatchFile } from "node:fs";
import { createConnection } from "node:net";
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const LOCK = join(ROOT, ".next/dev/lock");
const LOG = join(ROOT, ".next/dev/logs/next-development.log");
const NEXT_BIN = join(ROOT, "node_modules/.bin/next");
const DEFAULT_PORT = 3000;

type ServerInfo = {
  pid: number;
  port: number;
  hostname?: string;
  appUrl?: string;
};

function parsePortFlag(argv: string[]): { port: number; rest: string[] } {
  const rest: string[] = [];
  let port = Number(process.env.PORT) || DEFAULT_PORT;

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--port" || arg === "-p") {
      const value = Number(argv[i + 1]);
      if (Number.isFinite(value) && value > 0) {
        port = value;
        i += 1;
        continue;
      }
    }
    if (arg.startsWith("--port=")) {
      const value = Number(arg.slice("--port=".length));
      if (Number.isFinite(value) && value > 0) {
        port = value;
        continue;
      }
    }
    rest.push(arg);
  }

  return { port, rest };
}

function pidAlive(pid: number): boolean {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

function portInUse(port: number, host = "127.0.0.1"): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = createConnection({ port, host });
    const finish = (used: boolean) => {
      socket.removeAllListeners();
      socket.destroy();
      resolve(used);
    };
    socket.setTimeout(400);
    socket.once("connect", () => finish(true));
    socket.once("timeout", () => finish(false));
    socket.once("error", () => finish(false));
  });
}

async function firstFreePort(start: number): Promise<number> {
  for (let port = start; port < start + 50; port += 1) {
    if (!(await portInUse(port))) return port;
  }
  throw new Error(`No free port between ${start} and ${start + 49}`);
}

async function readLock(): Promise<ServerInfo | null> {
  try {
    const info = JSON.parse(await readFile(LOCK, "utf8")) as ServerInfo;
    if (!info?.pid || !info?.port) return null;
    return info;
  } catch {
    return null;
  }
}

async function liveServer(): Promise<ServerInfo | null> {
  const info = await readLock();
  if (!info || !pidAlive(info.pid)) return null;
  return info;
}

function urlFor(info: ServerInfo): string {
  return info.appUrl ?? `http://${info.hostname || "localhost"}:${info.port}`;
}

async function attach(info: ServerInfo): Promise<"detach" | "dead"> {
  const url = urlFor(info);
  console.log("▲ Next.js already running — attaching instead of exiting.");
  console.log(`- Local:         ${url}`);
  console.log(`- PID:           ${info.pid}`);
  console.log();
  console.log("Ctrl+C detaches this terminal. The existing server keeps running.");
  console.log();

  let offset = 0;
  try {
    offset = (await readFile(LOG)).byteLength;
  } catch {
    offset = 0;
  }

  const onChange = async () => {
    try {
      const buf = await readFile(LOG);
      if (buf.byteLength < offset) offset = 0;
      if (buf.byteLength > offset) {
        process.stdout.write(buf.subarray(offset));
        offset = buf.byteLength;
      }
    } catch {
      // Log may rotate while we attach.
    }
  };

  watchFile(LOG, { interval: 400 }, () => {
    void onChange();
  });

  return await new Promise<"detach" | "dead">((resolve) => {
    const finish = (reason: "detach" | "dead") => {
      unwatchFile(LOG);
      process.off("SIGINT", onSigint);
      process.off("SIGTERM", onSigint);
      clearInterval(timer);
      resolve(reason);
    };
    const onSigint = () => finish("detach");
    process.on("SIGINT", onSigint);
    process.on("SIGTERM", onSigint);
    const timer = setInterval(() => {
      if (!pidAlive(info.pid)) finish("dead");
    }, 1000);
  });
}

function startNext(port: number, extra: string[]): Promise<number> {
  return new Promise((resolve, reject) => {
    const child: ChildProcess = spawn(
      NEXT_BIN,
      ["dev", "--port", String(port), ...extra],
      {
        cwd: ROOT,
        stdio: "inherit",
        env: { ...process.env, PORT: String(port) },
      }
    );

    const forward = (signal: NodeJS.Signals) => {
      if (child.pid) child.kill(signal);
    };
    process.on("SIGINT", forward);
    process.on("SIGTERM", forward);

    child.on("error", (error) => {
      process.off("SIGINT", forward);
      process.off("SIGTERM", forward);
      reject(error);
    });
    child.on("exit", (code, signal) => {
      process.off("SIGINT", forward);
      process.off("SIGTERM", forward);
      if (signal) {
        resolve(0);
        return;
      }
      resolve(code ?? 0);
    });
  });
}

async function main() {
  const { port: requestedPort, rest } = parsePortFlag(process.argv.slice(2));

  const existing = await liveServer();
  if (existing) {
    const result = await attach(existing);
    if (result === "detach") {
      process.exit(0);
    }
    console.log("Existing Next.js server stopped. Starting a new one…");
  }

  const port = await firstFreePort(requestedPort);
  if (port !== requestedPort) {
    console.log(`Port ${requestedPort} is in use. Starting on ${port}.`);
  }

  const code = await startNext(port, rest);
  process.exit(code);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
