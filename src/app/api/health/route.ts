import { NextResponse } from "next/server";

import { prisma } from "@/server/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const headers = { "Cache-Control": "no-store" };

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json(
      { status: "ok", database: "connected" },
      { status: 200, headers },
    );
  } catch {
    console.error("Health check database query failed");
    return NextResponse.json(
      { status: "degraded", database: "unavailable" },
      { status: 503, headers },
    );
  }
}
