"use client";

import { Check, Copy, QrCode, X } from "lucide-react";
import { useState } from "react";
import type { CSSProperties } from "react";
import QRCode from "qrcode";
import { Dialog as DialogPrimitive } from "radix-ui";

/**
 * Career Card QR — opens the permanent /n/<token> share URL as a scannable
 * code. Client-only; receives the canonical public share URL from the
 * presentation adapter (never derives it). When `url` is null the caller
 * hides this component entirely.
 */
export function NfcCompactQr({
  url,
  accentStyle,
}: {
  url: string;
  /**
   * Accent CSS variables applied to the portaled dialog so --nfc-*
   * values still resolve outside the card's DOM subtree.
   */
  accentStyle?: CSSProperties;
}) {
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
        className="grid size-8 place-items-center rounded-lg border border-stone-200 bg-white text-[var(--nfc-strong)] shadow-sm transition hover:border-[var(--nfc-cta)]/40 hover:bg-[var(--nfc-cta)]/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--nfc-cta)]"
      >
        <QrCode className="size-4" aria-hidden />
      </button>
      <DialogPrimitive.Root open={open} onOpenChange={show}>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/40" />
          <DialogPrimitive.Content
            style={accentStyle}
            className="fixed top-1/2 left-1/2 z-50 w-[min(330px,calc(100vw-3rem))] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-stone-200 bg-[#fafaf9] p-5 shadow-xl focus:outline-none"
          >
            <div className="flex items-start justify-between">
              <div>
                <DialogPrimitive.Title className="text-base font-semibold text-blue-950">
                  Career Card QR
                </DialogPrimitive.Title>
                <DialogPrimitive.Description className="mt-0.5 text-xs text-stone-500">
                  Scan to open this Career Card
                </DialogPrimitive.Description>
              </div>
              <DialogPrimitive.Close
                aria-label="Close"
                className="grid size-8 place-items-center rounded-lg text-stone-500 transition hover:bg-stone-100 hover:text-stone-700"
              >
                <X className="size-4" aria-hidden />
              </DialogPrimitive.Close>
            </div>
            {/* credential-framed QR — corner marks */}
            <div className="relative mt-4 grid place-items-center rounded-xl border border-stone-200 bg-white p-4">
              {[0, 1, 2, 3].map((i) => (
                <span
                  key={i}
                  aria-hidden
                  className={`absolute size-2.5 rounded-[2px] bg-[var(--nfc-cta)] ${
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
            <div className="mt-3 rounded-lg bg-stone-100/70 px-3 py-2">
              <p className="text-[9px] font-bold uppercase tracking-wider text-stone-500">
                Permanent career link
              </p>
              <p className="mt-0.5 truncate text-xs font-medium text-blue-950">
                {displayUrl}
              </p>
            </div>
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={copy}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm font-medium text-stone-700 transition hover:bg-stone-50"
              >
                {copied ? (
                  <Check className="size-4 text-emerald-600" aria-hidden />
                ) : (
                  <Copy className="size-4" aria-hidden />
                )}
                {copied ? "Copied" : "Copy link"}
              </button>
              <a
                href={url}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-[var(--nfc-cta)] px-3 py-2 text-sm font-medium text-white transition hover:bg-[var(--nfc-cta-hover)]"
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
