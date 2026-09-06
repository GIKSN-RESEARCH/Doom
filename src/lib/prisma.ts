import { PrismaClient } from "@prisma/client";

/** Bump when the client factory changes so `next dev` HMR does not keep a stale singleton. */
const CLIENT_GEN = 2;

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrisma> | undefined;
  prismaGen: number | undefined;
};

function connectionUrl(): string {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is not set");
  }

  const extras: string[] = [];

  // Neon pooled hosts go through PgBouncer. Prisma needs this flag so it
  // does not use prepared statements that PgBouncer in transaction mode rejects.
  if (url.includes("-pooler") && !url.includes("pgbouncer=")) {
    extras.push("pgbouncer=true");
  }

  if (!url.includes("connection_limit=")) {
    extras.push("connection_limit=5");
  }

  // Neon compute sleeps on the free tier. Give it time to wake instead of
  // failing the first query after idle.
  if (!url.includes("connect_timeout=")) {
    extras.push("connect_timeout=15");
  }
  if (!url.includes("pool_timeout=")) {
    extras.push("pool_timeout=20");
  }

  if (extras.length === 0) return url;
  return `${url}${url.includes("?") ? "&" : "?"}${extras.join("&")}`;
}

function errorText(error: unknown): string {
  if (typeof error === "string") return error;
  if (error instanceof Error) return error.message;
  if (typeof error === "object" && error !== null && "message" in error) {
    return String((error as { message: unknown }).message);
  }
  return String(error);
}

function isTransientConnectionError(error: unknown): boolean {
  const message = errorText(error);
  const code =
    typeof error === "object" && error !== null && "code" in error
      ? String((error as { code: unknown }).code)
      : "";

  return (
    code === "P1017" ||
    code === "P1001" ||
    code === "P1002" ||
    code === "P1008" ||
    message.includes("kind: Closed") ||
    message.includes("Server has closed the connection") ||
    message.includes("Can't reach database server") ||
    message.includes("Connection refused") ||
    message.includes("ECONNRESET") ||
    message.includes("Connection terminated unexpectedly")
  );
}

function createPrisma() {
  const client = new PrismaClient({
    // Event emit keeps Closed/wake errors off stdout; we print only real failures.
    log: [{ emit: "event", level: "error" }],
    datasources: {
      db: {
        url: connectionUrl(),
      },
    },
  });

  client.$on("error", (event) => {
    if (isTransientConnectionError(event.message)) return;
    console.error(`prisma:error ${event.message}`);
  });

  let reconnecting: Promise<void> | null = null;

  const reconnect = async () => {
    if (!reconnecting) {
      reconnecting = (async () => {
        try {
          await client.$disconnect();
        } catch {
          // The previous socket is already dead.
        }
        await client.$connect();
      })().finally(() => {
        reconnecting = null;
      });
    }
    await reconnecting;
  };

  return client.$extends({
    query: {
      async $allOperations({ args, query }) {
        try {
          return await query(args);
        } catch (error) {
          if (!isTransientConnectionError(error)) throw error;
          await reconnect();
          return query(args);
        }
      },
    },
  });
}

function getPrisma() {
  if (
    process.env.NODE_ENV !== "production" &&
    globalForPrisma.prisma &&
    globalForPrisma.prismaGen === CLIENT_GEN
  ) {
    return globalForPrisma.prisma;
  }

  const client = createPrisma();
  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = client;
    globalForPrisma.prismaGen = CLIENT_GEN;
  }
  return client;
}

export const prisma = getPrisma();
