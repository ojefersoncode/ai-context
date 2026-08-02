import type { Database } from "../types/index.js";
import { hasDependency, type RootPackageJson } from "./package-json-reader.js";

const DATABASE_CHECKS: Array<{ database: Database; dependency: string }> = [
  { database: "prisma", dependency: "@prisma/client" },
  { database: "supabase", dependency: "@supabase/supabase-js" },
  { database: "drizzle", dependency: "drizzle-orm" },
  { database: "mongodb", dependency: "mongodb" },
  { database: "postgresql", dependency: "pg" },
];

export function detectDatabases(pkg: RootPackageJson | null): Database[] {
  if (!pkg) return [];

  return DATABASE_CHECKS.filter((check) =>
    hasDependency(pkg, check.dependency)
  ).map((check) => check.database);
}
