import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
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

  if (extras.length === 0) return url;
  return `${url}${url.includes("?") ? "&" : "?"}${extras.join("&")}`;
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ["error"],
    datasources: {
      db: {
        url: connectionUrl(),
      },
    },
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
