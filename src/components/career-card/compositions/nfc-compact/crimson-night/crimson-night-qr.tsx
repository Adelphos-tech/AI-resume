"use client";

import { useState } from "react";
import { Dialog as DialogPrimitive } from "radix-ui";
import { Check, Copy, QrCode, X } from "lucide-react";
import QRCode from "qrcode";
import { CRIMSON_NIGHT_VARS } from "./crimson-night-parts";

/**
 * Crimson Night QR — identical behavior to the light variant (same
 * QRCode.toDataURL call, same dark-on-white modules for scan reliability),
 * only the chrome is dark. Card is presentation-only — the /n/<token>
 * target is untouched.
 */
export function CrimsonNightQr({ url }: { url: string }) {
  const [open, setOpen] = useState(false);
  const [qr, setQr] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function show(v: boolean) {
    setOpen(v);
    if (v && qr === null) {
      const data = await QRCode.toDataURL(url, {
        width: 256,
        margin: 1,
        color: { dark: "#172554", light: "#ffffff" },
      });
      setQr(data);
    }
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable — no-op */
    }
  }

  const displayUrl = url.replace(/^https?:\/\//, "");

  return (
    <>
      <button
        type="button"
        aria-label="Show Career Card QR code"
        onClick={() => show(true)}
        className="grid size-8 place-items-center rounded-lg border border-[var(--cn-border-strong)] bg-[var(--cn-raise)] text-[var(--cn-muted)] shadow-sm transition hover:border-[var(--cn-cta)]/50 hover:text-[var(--cn-hi)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--cn-hi)]"
      >
        <QrCode className="size-4" aria-hidden />
      </button>
      <DialogPrimitive.Root open={open} onOpenChange={show}>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/70" />
          <DialogPrimitive.Content
            style={CRIMSON_NIGHT_VARS}
            className="fixed top-1/2 left-1/2 z-50 w-[min(330px,calc(100vw-3rem))] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-white/10 bg-[var(--cn-elev)] p-5 shadow-[0_32px_80px_-24px_rgba(0,0,0,0.8)] focus:outline-none"
          >
            <div className="flex items-start justify-between">
              <div>
                <DialogPrimitive.Title className="text-base font-semibold text-[var(--cn-text)]">
                  Career Card QR
                </DialogPrimitive.Title>
                <DialogPrimitive.Description className="mt-0.5 text-xs text-[var(--cn-muted)]">
                  Scan to open this Career Card
                </DialogPrimitive.Description>
              </div>
              <DialogPrimitive.Close
                aria-label="Close"
                className="grid size-8 place-items-center rounded-lg text-[var(--cn-muted)] transition hover:bg-white/5 hover:text-[var(--cn-text)]"
              >
                <X className="size-4" aria-hidden />
              </DialogPrimitive.Close>
            </div>
            {/* QR stays high-contrast dark-on-white — scan reliability */}
            <div className="relative mt-4 grid place-items-center rounded-xl border border-white/10 bg-white p-4">
              {[0, 1, 2, 3].map((i) => (
                <span
                  key={i}
                  aria-hidden
                  className={`absolute size-2.5 rounded-[2px] bg-[var(--cn-cta)] ${
                    i === 0
                      ? "top-2 left-2"
                      : i === 1
                        ? "top-2 right-2"
                        : i === 2
                          ? "bottom-2 left-2"
                          : "bottom-2 right-2"
                  }`}
                />
              ))}
              {qr ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={qr}
                  alt={`QR code for ${url}`}
                  className="size-48"
                  width={192}
                  height={192}
                />
              ) : (
                <div className="grid size-48 animate-pulse place-items-center text-xs text-stone-400">
                  Generating…
                </div>
              )}
            </div>
            <div className="mt-3 rounded-lg bg-white/5 px-3 py-2">
              <p className="text-[9px] font-bold uppercase tracking-wider text-[var(--cn-faint)]">
                Permanent career link
              </p>
              <p className="mt-0.5 truncate text-xs font-medium text-[var(--cn-text)]">
                {displayUrl}
              </p>
            </div>
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={copy}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-white/10 bg-[var(--cn-raise)] px-3 py-2 text-sm font-medium text-[var(--cn-muted)] transition hover:bg-[var(--cn-elev)] hover:text-[var(--cn-text)]"
              >
                {copied ? (
                  <Check className="size-4 text-emerald-500" aria-hidden />
                ) : (
                  <Copy className="size-4" aria-hidden />
                )}
                {copied ? "Copied" : "Copy link"}
              </button>
              <a
                href={url}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-[var(--cn-cta)] px-3 py-2 text-sm font-medium text-white transition hover:bg-[var(--cn-cta-hover)]"
              >
                Open Career Card
              </a>
            </div>
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
    </>
  );
}
