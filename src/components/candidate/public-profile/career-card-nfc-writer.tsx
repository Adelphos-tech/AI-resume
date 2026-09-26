"use client";

import {
  Check,
  Copy,
  ExternalLink,
  Info,
  Loader2,
  Nfc,
  ShieldAlert,
  WifiOff,
  X,
} from "lucide-react";
import { useMemo, useRef, useState, useSyncExternalStore } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";

type Stage =
  | { kind: "ready" }
  | { kind: "programming" }
  | { kind: "success" }
  | { kind: "error"; message: string };

function validateCareerCardUrl(raw: string): string | null {
  try {
    const url = new URL(raw);
    const isHttps = url.protocol === "https:";
    const isLocal =
      url.protocol === "http:" &&
      (url.hostname === "localhost" || url.hostname === "127.0.0.1");
    if ((!isHttps && !isLocal) || !url.pathname.startsWith("/n/")) return null;
    return url.toString();
  } catch {
    return null;
  }
}

function nfcSupported(): boolean {
  return window.isSecureContext === true && "NDEFReader" in window;
}

const subscribe = () => () => {};

const DESKTOP_QUERY = "(min-width: 640px)";

function subscribeDesktop(cb: () => void) {
  const mql = window.matchMedia(DESKTOP_QUERY);
  mql.addEventListener("change", cb);
  return () => mql.removeEventListener("change", cb);
}

function errorCopy(err: unknown): string {
  if (err instanceof DOMException) {
    switch (err.name) {
      case "NotAllowedError":
        return "NFC permission was not granted.";
      case "NotSupportedError":
      case "SecurityError":
        return "NFC programming isn’t supported on this device or browser.";
      case "AbortError":
        return "Programming was cancelled.";
      default:
        break;
    }
  }
  const msg = err instanceof Error ? err.message.toLowerCase() : "";
  if (/read.?only|locked|not.?compatible|ndef/i.test(msg)) {
    return "This NFC card may be read-only, locked, or incompatible. Try another writable NDEF-compatible NFC card.";
  }
  if (/tag|card|hardware|io|network/i.test(msg)) {
    return "We couldn’t communicate with this NFC card.";
  }
  return "We couldn’t program this card. Try again or use an NFC-writing app.";
}

export function CareerCardNfcWriter({
  careerCardUrl,
}: {
  careerCardUrl: string;
}) {
  const url = useMemo(
    () => validateCareerCardUrl(careerCardUrl),
    [careerCardUrl],
  );
  // getServerSnapshot returns "unknown" so SSR and first hydration render
  // agree — the real capability is resolved client-side after mount.
  const supported = useSyncExternalStore<boolean | null>(
    subscribe,
    () => nfcSupported(),
    () => null,
  );
  // Reactive so the correct surface renders if the viewport is resized.
  const isDesktop = useSyncExternalStore(
    subscribeDesktop,
    () => window.matchMedia(DESKTOP_QUERY).matches,
    () => true,
  );
  const [stage, setStage] = useState<Stage>({ kind: "ready" });
  const [copied, setCopied] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  const focused = stage.kind !== "ready";

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(careerCardUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  function cancel() {
    abortRef.current?.abort();
    setStage({ kind: "ready" });
    // Radix restores focus on normal close, but the dialog unmounts on this
    // stage transition — return focus to the trigger explicitly.
    requestAnimationFrame(() => triggerRef.current?.focus());
  }

  async function program() {
    if (!url || !supported || stage.kind === "programming") return;
    const ndef = new window.NDEFReader!();
    abortRef.current = new AbortController();
    setStage({ kind: "programming" });
    try {
      await ndef.write(
        { records: [{ recordType: "url", data: url }] },
        { signal: abortRef.current.signal },
      );
      setStage({ kind: "success" });
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        setStage({ kind: "ready" });
      } else {
        setStage({ kind: "error", message: errorCopy(err) });
      }
    } finally {
      abortRef.current = null;
    }
  }

  const stageContent =
    stage.kind === "programming" ? (
      <>
        <span className="relative mx-auto mt-10 flex size-24 items-center justify-center">
          <span
            aria-hidden
            className="absolute inset-0 animate-ping rounded-full bg-emerald-400/30"
          />
          <span
            aria-hidden
            className="absolute inset-3 animate-pulse rounded-full bg-emerald-400/15 sm:bg-emerald-100"
          />
          <Nfc
            className="relative size-10 text-emerald-300 sm:text-emerald-700"
            aria-hidden
          />
        </span>
        <p className="mt-10 text-lg font-semibold">
          Hold your card near your phone
        </p>
        <p className="mt-2 text-sm leading-relaxed text-emerald-100/70 sm:text-stone-600">
          Keep the NFC card close to the back of your phone until programming
          completes.
        </p>
        <p
          role="status"
          className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-emerald-300 sm:text-emerald-700"
        >
          <Loader2 className="size-4 animate-spin" aria-hidden />
          Programming…
        </p>
        <Button
          type="button"
          variant="outline"
          onClick={cancel}
          className="mt-6 min-h-11 w-full border-emerald-400/40 bg-transparent text-emerald-100 hover:bg-emerald-900 hover:text-white sm:w-auto sm:border-stone-200 sm:bg-white sm:text-stone-700 sm:hover:bg-stone-50 sm:hover:text-stone-900"
        >
          Cancel
        </Button>
      </>
    ) : stage.kind === "success" ? (
      <div className="flex flex-col items-center">
        <span className="mt-8 flex size-16 items-center justify-center rounded-full bg-emerald-400/20 sm:bg-emerald-100">
          <Check
            className="size-8 text-emerald-300 sm:text-emerald-700"
            aria-hidden
          />
        </span>
        <p role="status" className="mt-5 text-lg font-semibold">
          Career Card programmed
        </p>
        <p className="mt-1.5 max-w-xs text-sm leading-relaxed text-emerald-100/70 sm:text-stone-600">
          Your permanent Career Card link has been written to the NFC card.
        </p>
        <div className="mt-6 flex w-full max-w-xs flex-col gap-2">
          <Button
            type="button"
            onClick={cancel}
            className="min-h-11 bg-emerald-600 text-white hover:bg-emerald-500 sm:bg-emerald-700 sm:hover:bg-emerald-800"
          >
            Done
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => window.open(careerCardUrl, "_blank", "noreferrer")}
            className="min-h-11 border-emerald-400/40 bg-transparent text-emerald-100 hover:bg-emerald-900 hover:text-white sm:border-stone-200 sm:bg-white sm:text-stone-700 sm:hover:bg-stone-50 sm:hover:text-stone-900"
          >
            <ExternalLink className="size-4" aria-hidden />
            Open Career Card
          </Button>
        </div>
        <div className="mt-6 w-full max-w-xs rounded-xl border border-amber-300/30 bg-amber-400/10 px-4 py-3 text-left sm:border-amber-200/70 sm:bg-amber-50/60">
          <p className="flex items-center gap-1.5 text-xs font-semibold tracking-wide text-amber-300 sm:text-amber-800">
            <Info className="size-3.5" aria-hidden />
            Next step: Verify the card
          </p>
          <p className="mt-1 text-sm leading-relaxed text-emerald-100/70 sm:text-stone-600">
            In the next update, you’ll be able to verify your NFC card directly
            here.
          </p>
        </div>
      </div>
    ) : (
      <div className="mt-8 w-full">
        <p
          role="alert"
          className="flex items-start gap-2 rounded-lg border border-red-300/40 bg-red-500/15 px-4 py-3 text-left text-sm text-red-100 sm:border-red-200 sm:bg-red-50 sm:text-red-700"
        >
          <ShieldAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
          {stage.kind === "error" ? stage.message : null}
        </p>
        <div className="mt-5 flex w-full flex-col gap-2 sm:flex-row sm:justify-center">
          <Button
            type="button"
            onClick={program}
            disabled={!url}
            className="min-h-11 bg-emerald-600 text-white hover:bg-emerald-500 sm:bg-emerald-700 sm:hover:bg-emerald-800"
          >
            Try Again
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={copyLink}
            className="min-h-11 border-emerald-400/40 bg-transparent text-emerald-100 hover:bg-emerald-900 hover:text-white sm:border-stone-200 sm:bg-white sm:text-stone-700 sm:hover:bg-stone-50 sm:hover:text-stone-900"
          >
            <Copy className="size-4" aria-hidden />
            {copied ? "Copied" : "Copy Career Card Link"}
          </Button>
        </div>
      </div>
    );

  const shell =
    "rounded-2xl border border-emerald-900/10 bg-gradient-to-br from-emerald-50/80 via-white to-emerald-50/40 p-6";

  return (
    <section aria-labelledby="pp-nfc" className={shell}>
      {supported === false ? (
        <div className="flex flex-col items-center rounded-2xl bg-white px-4 py-8 text-center sm:border sm:border-stone-100">
          <span className="flex size-14 items-center justify-center rounded-full bg-stone-100">
            <WifiOff className="size-7 text-stone-400" aria-hidden />
          </span>
          <h2
            id="pp-nfc"
            className="mt-4 text-base font-semibold text-stone-900"
          >
            NFC programming isn’t available in this browser.
          </h2>
          <p className="mt-1.5 max-w-xs text-sm leading-relaxed text-stone-600">
            You can still program your card using an NFC-writing app such as NFC
            Tools.
          </p>
          <Button
            type="button"
            onClick={copyLink}
            className="mt-5 min-h-11 bg-emerald-700 hover:bg-emerald-800"
          >
            <Copy className="size-4" aria-hidden />
            {copied ? "Copied" : "Copy Career Card Link"}
          </Button>
          <p className="mt-5 flex items-center gap-1.5 text-xs leading-relaxed text-stone-500">
            <Info className="size-3.5 shrink-0" aria-hidden />
            Works with writable NDEF NFC tags such as NTAG213 · NTAG215 ·
            NTAG216.
          </p>
        </div>
      ) : !focused ? (
        <>
          <h2
            id="pp-nfc"
            className="flex items-center gap-2 text-base font-semibold text-stone-900"
          >
            <Nfc className="size-4 text-emerald-700" aria-hidden />
            Program Physical Card
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-stone-600">
            Turn a compatible NFC card into your RoleRace Career Card. We’ll
            write your permanent link to the card.
          </p>
          <Button
            type="button"
            ref={triggerRef}
            onClick={program}
            disabled={!url || supported !== true}
            className="mt-4 min-h-11 bg-emerald-700 hover:bg-emerald-800"
          >
            <Nfc className="size-4" aria-hidden />
            Program NFC Card
          </Button>
          <p className="mt-4 text-xs leading-relaxed text-stone-500">
            Works with writable NDEF NFC tags such as NTAG213 · NTAG215 ·
            NTAG216.
          </p>
        </>
      ) : /* Focused programming surface — full viewport on phones, contained
           centered panel on larger screens. */
      isDesktop ? (
        <div className="relative mx-auto flex max-w-xs flex-col items-center rounded-2xl bg-white px-5 py-10 text-center text-stone-900 ring-1 ring-stone-200">
          <button
            type="button"
            onClick={cancel}
            aria-label="Cancel programming"
            className="absolute top-2 right-0 rounded-full p-2 text-stone-400 hover:text-stone-700"
          >
            <X className="size-5" aria-hidden />
          </button>
          <h3 className="text-base font-semibold">Program NFC Card</h3>
          {stageContent}
        </div>
      ) : (
        <Dialog
          open
          onOpenChange={(open) => {
            if (!open) cancel();
          }}
        >
          <DialogContent
            className="overflow-y-auto bg-emerald-950 text-white"
            style={{
              paddingTop: "env(safe-area-inset-top)",
              paddingBottom: "env(safe-area-inset-bottom)",
            }}
          >
            <div className="relative mx-auto flex min-h-[calc(100svh-env(safe-area-inset-top)-env(safe-area-inset-bottom))] max-w-xs flex-col items-center justify-center px-5 py-10 text-center">
              <button
                type="button"
                onClick={cancel}
                aria-label="Cancel programming"
                className="absolute top-2 right-0 rounded-full p-2 text-emerald-200/70 hover:text-white"
              >
                <X className="size-5" aria-hidden />
              </button>
              <DialogTitle className="text-base font-semibold">
                Program NFC Card
              </DialogTitle>
              <DialogDescription className="sr-only">
                Hold a compatible NFC card near the back of your phone to write
                your permanent Career Card link.
              </DialogDescription>
              {stageContent}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </section>
  );
}
