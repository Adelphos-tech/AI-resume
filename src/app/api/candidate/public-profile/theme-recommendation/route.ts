import { NextResponse } from "next/server";

import { recommendTheme } from "@/server/ai/theme-recommendation";
import { getCandidateSession } from "@/server/session";

export const runtime = "nodejs";

/**
 * Explicit candidate-triggered theme recommendation. Session-derived
 * ownership only — no candidateId from the client; nothing persisted.
 */
export async function POST() {
  const context = await getCandidateSession();
  if (!context) {
    return NextResponse.json(
      { success: false, message: "Unauthorized." },
      { status: 401 },
    );
  }

  const result = await recommendTheme(context.candidate.id);
  if (!result.success) {
    return NextResponse.json(
      { success: false, code: result.code, message: result.message },
      { status: result.code === "THIN_PROFILE" ? 422 : 502 },
    );
  }
  return NextResponse.json({
    success: true,
    recommendation: result.recommendation,
  });
}
