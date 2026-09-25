import { NextResponse } from "next/server";

import {
  MAX_REQUEST_BYTES,
  parseResumeUpload,
  storeCandidateResume,
  UploadError,
} from "@/server/resume-storage/upload-resume";
import { getCandidateSession } from "@/server/session";

function fail(status: number, message: string) {
  return NextResponse.json({ success: false, message }, { status });
}

export async function POST(request: Request) {
  const context = await getCandidateSession();
  if (!context) {
    return fail(401, "Unauthorized.");
  }

  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > MAX_REQUEST_BYTES) {
    return fail(413, "Resume must be 10 MB or smaller.");
  }

  let upload: { fileName: string; bytes: Buffer };
  try {
    upload = await parseResumeUpload(request);
  } catch (error) {
    if (error instanceof UploadError) {
      return fail(error.status, error.message);
    }
    return fail(400, "Invalid upload request.");
  }

  const stored = await storeCandidateResume(context.candidate.id, upload);
  if (!stored.success) {
    return fail(
      stored.message === "Upload a PDF or DOCX file." ? 422 : 500,
      stored.message,
    );
  }

  return NextResponse.json({ success: true, resume: stored.resume });
}
