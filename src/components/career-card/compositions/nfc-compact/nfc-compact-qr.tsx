"use client";

import { Check, Copy, QrCode, X } from "lucide-react";
import { useState } from "react";
import QRCode from "qrcode";
import { Dialog as DialogPrimitive } from "radix-ui";

/**
 * Career Card QR — opens the permanent /n/<token> share URL as a scannable
 * code. Client-only; receives the canonical public share URL from the
 * presentation adapter (never derives it). When `url` is null the caller
 * hides this component entirely.
 */
export function NfcCompactQr({ url }: { url: string }) {
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

  return (
    <>
      <button
        type="button"
        aria-label="Show Career Card QR code"
        onClick={() => show(true)}
        className="grid size-7 place-items-center rounded-md border border-sky-200 bg-sky-50 text-[var(--nfc-strong)] transition hover:bg-sky-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500"
      >
        <QrCode className="size-4" aria-hidden />
      </button>
      <DialogPrimitive.Root open={open} onOpenChange={show}>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/40" />
          <DialogPrimitive.Content className="fixed top-1/2 left-1/2 z-50 w-[min(320px,calc(100vw-3rem))] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-stone-200 bg-white p-5 shadow-xl focus:outline-none">
            <div className="flex items-start justify-between">
              <div>
                <DialogPrimitive.Title className="text-base font-semibold text-stone-900">
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
            <div className="mt-4 grid place-items-center rounded-xl border border-stone-200 bg-white p-3">
              {qr ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={qr}
                  alt={`QR code for ${url}`}
                  className="size-52"
                  width={208}
                  height={208}
                />
              ) : (
                <div className="grid size-52 animate-pulse place-items-center text-xs text-stone-400">
                  Generating…
                </div>
              )}
            </div>
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={copy}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-stone-200 px-3 py-2 text-sm font-medium text-stone-700 transition hover:bg-stone-50"
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
                className="flex flex-1 items-center justify-center rounded-lg bg-[var(--nfc-cta)] px-3 py-2 text-sm font-medium text-white transition hover:bg-[var(--nfc-cta-hover)]"
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
