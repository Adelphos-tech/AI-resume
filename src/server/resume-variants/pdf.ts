import "server-only";

import { chromium, type Browser } from "playwright";

import { RESUME_TEMPLATES } from "@/lib/resume-schema";
import { env } from "@/server/env";

const MAX_PDF_BYTES = 10 * 1024 * 1024; // 10 MiB
const NAV_TIMEOUT_MS = 30_000;
const READY_TIMEOUT_MS = 15_000;
const SESSION_COOKIE = "better-auth.session_token";

/**
 * Generate the ATS Classic PDF for a ResumeVariant.
 *
 * The PDF is produced by navigating a headless Chromium to the
 * internal print surface — so the exported document is rendered by
 * the exact same ResumeRenderer as the browser preview. There is no
 * second resume template for PDF.
 *
 * Navigation target is constructed server-side from the controlled
 * PDF_RENDER_ORIGIN only — never from request URLs or user input.
 * The operator's session cookie is scoped to that origin only.
 *
 * Generation is on-demand and writes nothing.
 */
export async function generateResumePdf(input: {
  candidateId: string;
  variantId: string;
  sessionToken: string;
  templateKey: string;
}): Promise<Buffer> {
  if (!Object.hasOwn(RESUME_TEMPLATES, input.templateKey)) {
    throw new Error(`Unsupported resume template: ${input.templateKey}`);
  }
  const origin = new URL(env.PDF_RENDER_ORIGIN);
  const renderUrl = `${origin.origin}/print/resume/${encodeURIComponent(
    input.candidateId,
  )}/${encodeURIComponent(input.variantId)}`;

  let browser: Browser | null = null;
  try {
    browser = await chromium.launch();
    const context = await browser.newContext();

    // Transfer only the session cookie, scoped to our own origin.
    await context.addCookies([
      {
        name: SESSION_COOKIE,
        value: input.sessionToken,
        domain: origin.hostname,
        path: "/",
      },
    ]);

    const page = await context.newPage();
    page.setDefaultTimeout(READY_TIMEOUT_MS);
    page.setDefaultNavigationTimeout(NAV_TIMEOUT_MS);

    // The document has no external assets; block any unexpected
    // off-origin request rather than fetching candidate-provided URLs.
    await page.route("**/*", (route) => {
      const url = route.request().url();
      route[url.startsWith(origin.origin) ? "continue" : "abort"]();
    });

    await page.goto(renderUrl, { waitUntil: "domcontentloaded" });

    // Readiness = the real resume root for the expected template.
    await page.waitForSelector(
      `[data-resume-document][data-resume-template="${input.templateKey}"]`,
      { timeout: READY_TIMEOUT_MS },
    );
    await page.evaluate(() => document.fonts.ready);

    const pdf = await page.pdf({
      preferCSSPageSize: true, // @page A4 + margins in globals.css
      printBackground: true,
      tagged: true,
    });

    if (
      pdf.length === 0 ||
      pdf.length > MAX_PDF_BYTES ||
      !pdf.subarray(0, 4).equals(Buffer.from("%PDF"))
    ) {
      throw new Error("Generated PDF failed validation");
    }

    return pdf;
  } finally {
    await browser?.close();
  }
}

export { resumeExportFileName } from "./file-name";
