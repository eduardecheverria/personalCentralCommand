import { NextRequest, NextResponse } from "next/server";
import { redis } from "@/lib/redis";

// El sync es por-usuario; nunca debe cachearse.
export const dynamic = "force-dynamic";

type SyncBlob = { data: Record<string, string>; updated_at: number };

const keyFor = (code: string) => `cdm:sync:${code}`;

// GET /api/sync?code=XXX  ->  { data, updated_at }  (o {} si no hay nada)
export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  if (!code) {
    return NextResponse.json({ error: "missing code" }, { status: 400 });
  }
  const blob = await redis.get<SyncBlob>(keyFor(code));
  return NextResponse.json(blob ?? {});
}

// POST /api/sync  body: { code, data, updated_at }
export async function POST(req: NextRequest) {
  let body: Partial<SyncBlob> & { code?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const { code, data, updated_at } = body;
  if (!code || typeof code !== "string") {
    return NextResponse.json({ error: "missing code" }, { status: 400 });
  }
  if (!data || typeof data !== "object") {
    return NextResponse.json({ error: "missing data" }, { status: 400 });
  }

  const blob: SyncBlob = { data, updated_at: updated_at ?? Date.now() };
  await redis.set(keyFor(code), blob);
  return NextResponse.json({ ok: true, updated_at: blob.updated_at });
}
