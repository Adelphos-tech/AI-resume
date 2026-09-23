/**
 * Safe ASCII filename for a downloaded export — no CR/LF, no control
 * characters, no path separators. Shared by the PDF and DOCX routes.
 */
export function resumeExportFileName(name: string, extension: string): string {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
  return `${slug || "resume"}.${extension}`;
}
