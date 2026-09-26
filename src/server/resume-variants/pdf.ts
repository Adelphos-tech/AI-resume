import "server-only";

import { chromium, type Browser } from "playwright";

import { RESUME_TEMPLATES } from "@/lib/resume-schema";
import { env } from "@/server/env";

const MAX_PDF_BYTES = 10 * 1024 * 1024; // 10 MiB
const NAV_TIMEOUT_MS = 30_000;
const READY_TIMEOUT_MS = 15_000;
/**
 * Session cookie name is supplied by the caller: production HTTPS
 * sessions use the `__Secure-` prefix and Better Auth only reads that
 * name; local HTTP sessions use the plain name.
 */

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
  printPath: string;
  sessionToken: string;
  sessionCookieName: string;
  templateKey: string;
}): Promise<Buffer> {
  if (!Object.hasOwn(RESUME_TEMPLATES, input.templateKey)) {
    throw new Error(`Unsupported resume template: ${input.templateKey}`);
  }
  const origin = new URL(env.PDF_RENDER_ORIGIN);
  // Server-controlled render target: the caller supplies ONLY a trusted
  // internal path (never request URLs or user input); the origin always
  // comes from the controlled PDF_RENDER_ORIGIN env.
  const renderUrl = `${origin.origin}${input.printPath}`;

  let browser: Browser | null = null;
  try {
    browser = await chromium.launch();
    const context = await browser.newContext();

    // Transfer only the session cookie, scoped to our own origin.
    // A `__Secure-` cookie requires secure transport, so PDF_RENDER_ORIGIN
    // must be the real HTTPS origin in production (not a loopback URL).
    await context.addCookies([
      {
        name: input.sessionCookieName,
        value: input.sessionToken,
        secure: input.sessionCookieName.startsWith("__Secure-"),
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
