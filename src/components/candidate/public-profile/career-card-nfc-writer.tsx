"use client";

import {
  BadgeCheck,
  Check,
  Copy,
  ExternalLink,
  Info,
  Loader2,
  Nfc,
  ScanLine,
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
  | { kind: "programmed" }
  | { kind: "verifying" }
  | { kind: "verified" }
  | { kind: "wrongCard" }
  | { kind: "emptyCard" }
  | { kind: "error"; message: string; source: "program" | "verify" };

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

// NDEF RTD URI identifier-code table — the first payload byte of a "url"
// record encodes a scheme prefix. Only the values RoleRace can plausibly
// encounter are decoded.
const URI_PREFIXES: Record<number, string> = {
  0x00: "",
  0x01: "http://www.",
  0x02: "https://www.",
  0x03: "http://",
  0x04: "https://",
  0x05: "tel:",
  0x06: "mailto:",
};

// A "url" record's payload is an NDEF URI record: byte 0 is the URI
// identifier code (per the RTD URI table) and bytes 1..n are the UTF-8
// URI suffix. Web NFC delivers the record as a DataView without prefix
// expansion, so the prefix is applied exactly once here.
function decodeUrlRecord(record: NDEFRecord): string | null {
  if (record.recordType !== "url") return null;
  const view = record.data;
  if (!(view instanceof DataView) || view.byteLength < 1) return null;
  const prefix = URI_PREFIXES[view.getUint8(0)] ?? "";
  try {
    const bytes = new Uint8Array(
      view.buffer,
      view.byteOffset + 1,
      view.byteLength - 1,
    );
    return prefix + new TextDecoder().decode(bytes);
  } catch {
    return null;
  }
}

function firstUrlOnTag(records: NDEFRecord[]): string | null {
  for (const record of records) {
    const decoded = decodeUrlRecord(record);
    if (decoded) return decoded;
  }
  return null;
}

function urlsEqual(a: string, b: string): boolean {
  try {
    return new URL(a).href === new URL(b).href;
  } catch {
    return false;
  }
}

function errorCopy(err: unknown, source: "program" | "verify"): string {
  if (err instanceof DOMException) {
    switch (err.name) {
      case "NotAllowedError":
        return "NFC permission was not granted.";
      case "NotSupportedError":
      case "SecurityError":
        return source === "verify"
          ? "NFC scanning isn’t supported on this device or browser."
          : "NFC programming isn’t supported on this device or browser.";
      case "AbortError":
        return source === "verify"
          ? "Verification was cancelled."
          : "Programming was cancelled.";
      default:
        break;
    }
  }
  const msg = err instanceof Error ? err.message.toLowerCase() : "";
  if (/read.?only|locked|not.?compatible|ndef/i.test(msg)) {
    return "This NFC card may be read-only, locked, or incompatible. Try another writable NDEF-compatible NFC card.";
  }
  if (/tag|card|hardware|io|network/i.test(msg)) {
    return source === "verify"
      ? "We couldn’t read this NFC card. Try again."
      : "We couldn’t communicate with this NFC card.";
  }
  return source === "verify"
    ? "We couldn’t verify this card."
    : "We couldn’t program this card. Try again or use an NFC-writing app.";
}

const VERIFY_STAGES = new Set([
  "verifying",
  "verified",
  "wrongCard",
  "emptyCard",
]);

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
  const programTriggerRef = useRef<HTMLButtonElement | null>(null);
  const verifyTriggerRef = useRef<HTMLButtonElement | null>(null);
  const lastTrigger = useRef<"program" | "verify">("program");

  const focused = stage.kind !== "ready";
  const isVerifyFlow =
    VERIFY_STAGES.has(stage.kind) ||
    (stage.kind === "error" && stage.source === "verify");

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
    // The dialog unmounts on this stage transition — return focus to the
    // trigger that opened it.
    requestAnimationFrame(() =>
      (lastTrigger.current === "verify"
        ? verifyTriggerRef
        : programTriggerRef
      ).current?.focus(),
    );
  }

  async function program() {
    if (!url || supported !== true || stage.kind === "programming") return;
    lastTrigger.current = "program";
    const ndef = new window.NDEFReader!();
    abortRef.current = new AbortController();
    setStage({ kind: "programming" });
    try {
      await ndef.write(
        { records: [{ recordType: "url", data: url }] },
        { signal: abortRef.current.signal },
      );
      setStage({ kind: "programmed" });
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        setStage({ kind: "ready" });
      } else {
        setStage({
          kind: "error",
          source: "program",
          message: errorCopy(err, "program"),
        });
      }
    } finally {
      abortRef.current = null;
    }
  }

  async function verify() {
    if (!url || supported !== true || stage.kind === "verifying") return;
    lastTrigger.current = "verify";
    const reader = new window.NDEFReader!();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setStage({ kind: "verifying" });

    let settled = false;
    const onReading = (event: NDEFReadingEvent) => {
      if (settled) return;
      settled = true;
      const found = firstUrlOnTag(event.message.records);
      if (!found) setStage({ kind: "emptyCard" });
      else if (urlsEqual(found, url)) setStage({ kind: "verified" });
      else setStage({ kind: "wrongCard" });
      ctrl.abort();
    };
    const onReadingError = () => {
      if (settled) return;
      settled = true;
      setStage({
        kind: "error",
        source: "verify",
        message: "We couldn’t read this NFC card. Try again.",
      });
      ctrl.abort();
    };
    reader.addEventListener("reading", onReading);
    reader.addEventListener("readingerror", onReadingError);

    try {
      await reader.scan({ signal: ctrl.signal });
    } catch (err) {
      reader.removeEventListener("reading", onReading);
      reader.removeEventListener("readingerror", onReadingError);
      if (err instanceof DOMException && err.name === "AbortError") {
        setStage({ kind: "ready" });
      } else {
        setStage({
          kind: "error",
          source: "verify",
          message: errorCopy(err, "verify"),
        });
      }
    }
  }

  const shell =
    "rounded-2xl border border-emerald-900/10 bg-gradient-to-br from-emerald-50/80 via-white to-emerald-50/40 p-6";

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
    ) : stage.kind === "programmed" ? (
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
            onClick={verify}
            className="min-h-11 bg-emerald-600 text-white hover:bg-emerald-500 sm:bg-emerald-700 sm:hover:bg-emerald-800"
          >
            <BadgeCheck className="size-4" aria-hidden />
            Verify Card
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
          <Button
            type="button"
            variant="outline"
            onClick={cancel}
            className="min-h-11 border-emerald-400/40 bg-transparent text-emerald-100 hover:bg-emerald-900 hover:text-white sm:border-stone-200 sm:bg-white sm:text-stone-700 sm:hover:bg-stone-50 sm:hover:text-stone-900"
          >
            Done
          </Button>
        </div>
      </div>
    ) : stage.kind === "verifying" ? (
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
          <ScanLine
            className="relative size-10 text-emerald-300 sm:text-emerald-700"
            aria-hidden
          />
        </span>
        <p className="mt-10 text-lg font-semibold">
          Tap your card to your phone
        </p>
        <p className="mt-2 text-sm leading-relaxed text-emerald-100/70 sm:text-stone-600">
          Hold the card near the back of your phone while RoleRace checks it.
        </p>
        <p
          role="status"
          className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-emerald-300 sm:text-emerald-700"
        >
          <Loader2 className="size-4 animate-spin" aria-hidden />
          Checking card…
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
    ) : stage.kind === "verified" ? (
      <div className="flex flex-col items-center">
        <span className="mt-8 flex size-16 items-center justify-center rounded-full bg-emerald-400/20 sm:bg-emerald-100">
          <BadgeCheck
            className="size-8 text-emerald-300 sm:text-emerald-700"
            aria-hidden
          />
        </span>
        <p role="status" className="mt-5 text-lg font-semibold">
          Career Card verified
        </p>
        <p className="mt-1.5 max-w-xs text-sm leading-relaxed text-emerald-100/70 sm:text-stone-600">
          This NFC card contains your permanent Career Card link.
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
      </div>
    ) : stage.kind === "wrongCard" ? (
      <div className="flex flex-col items-center">
        <span className="mt-8 flex size-16 items-center justify-center rounded-full bg-amber-400/20 sm:bg-amber-100">
          <ShieldAlert
            className="size-8 text-amber-300 sm:text-amber-700"
            aria-hidden
          />
        </span>
        <p role="status" className="mt-5 text-lg font-semibold">
          This isn’t your Career Card
        </p>
        <p className="mt-1.5 max-w-xs text-sm leading-relaxed text-emerald-100/70 sm:text-stone-600">
          The NFC card contains a different link.
        </p>
        <div className="mt-6 flex w-full max-w-xs flex-col gap-2">
          <Button
            type="button"
            onClick={verify}
            className="min-h-11 bg-emerald-600 text-white hover:bg-emerald-500 sm:bg-emerald-700 sm:hover:bg-emerald-800"
          >
            Try Again
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={program}
            className="min-h-11 border-emerald-400/40 bg-transparent text-emerald-100 hover:bg-emerald-900 hover:text-white sm:border-stone-200 sm:bg-white sm:text-stone-700 sm:hover:bg-stone-50 sm:hover:text-stone-900"
          >
            <Nfc className="size-4" aria-hidden />
            Reprogram Card
          </Button>
        </div>
      </div>
    ) : stage.kind === "emptyCard" ? (
      <div className="flex flex-col items-center">
        <span className="mt-8 flex size-16 items-center justify-center rounded-full bg-amber-400/20 sm:bg-amber-100">
          <ShieldAlert
            className="size-8 text-amber-300 sm:text-amber-700"
            aria-hidden
          />
        </span>
        <p role="status" className="mt-5 text-lg font-semibold">
          No Career Card link found
        </p>
        <p className="mt-1.5 max-w-xs text-sm leading-relaxed text-emerald-100/70 sm:text-stone-600">
          This NFC card doesn’t contain a compatible Career Card link.
        </p>
        <div className="mt-6 flex w-full max-w-xs flex-col gap-2">
          <Button
            type="button"
            onClick={verify}
            className="min-h-11 bg-emerald-600 text-white hover:bg-emerald-500 sm:bg-emerald-700 sm:hover:bg-emerald-800"
          >
            Try Again
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={program}
            className="min-h-11 border-emerald-400/40 bg-transparent text-emerald-100 hover:bg-emerald-900 hover:text-white sm:border-stone-200 sm:bg-white sm:text-stone-700 sm:hover:bg-stone-50 sm:hover:text-stone-900"
          >
            <Nfc className="size-4" aria-hidden />
            Program Card
          </Button>
        </div>
      </div>
    ) : stage.kind === "error" ? (
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
            onClick={stage.source === "verify" ? verify : program}
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
    ) : null;

  const dialogTitle = isVerifyFlow ? "Verify NFC Card" : "Program NFC Card";
  const dialogDescription = isVerifyFlow
    ? "Tap a programmed NFC card to check that it contains your permanent Career Card link."
    : "Hold a compatible NFC card near the back of your phone to write your permanent Career Card link.";

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
            Tools, and test it by tapping it — your Career Card should open.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            <Button
              type="button"
              onClick={copyLink}
              className="min-h-11 bg-emerald-700 hover:bg-emerald-800"
            >
              <Copy className="size-4" aria-hidden />
              {copied ? "Copied" : "Copy Career Card Link"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => window.open(careerCardUrl, "_blank", "noreferrer")}
              className="min-h-11"
            >
              <ExternalLink className="size-4" aria-hidden />
              Open Career Card
            </Button>
          </div>
          <p className="mt-5 flex items-center gap-1.5 text-xs leading-relaxed text-stone-500">
            <Info className="size-3.5" aria-hidden />
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
          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              type="button"
              ref={programTriggerRef}
              onClick={program}
              disabled={!url || supported !== true}
              className="min-h-11 bg-emerald-700 hover:bg-emerald-800"
            >
              <Nfc className="size-4" aria-hidden />
              Program NFC Card
            </Button>
            <Button
              type="button"
              ref={verifyTriggerRef}
              variant="outline"
              onClick={verify}
              disabled={!url || supported !== true}
              className="min-h-11"
            >
              <BadgeCheck className="size-4" aria-hidden />
              Verify Card
            </Button>
          </div>
          <p className="mt-4 text-xs leading-relaxed text-stone-500">
            Works with writable NDEF NFC tags such as NTAG213 · NTAG215 ·
            NTAG216.
          </p>
        </>
      ) : isDesktop ? (
        <div className="relative mx-auto flex max-w-xs flex-col items-center rounded-2xl bg-white px-5 py-10 text-center text-stone-900 ring-1 ring-stone-200">
          <button
            type="button"
            onClick={cancel}
            aria-label={
              isVerifyFlow ? "Close verification" : "Cancel programming"
            }
            className="absolute top-2 right-0 rounded-full p-2 text-stone-400 hover:text-stone-700"
          >
            <X className="size-5" aria-hidden />
          </button>
          <h3 className="text-base font-semibold">{dialogTitle}</h3>
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
                aria-label={
                  isVerifyFlow ? "Close verification" : "Cancel programming"
                }
                className="absolute top-2 right-0 rounded-full p-2 text-emerald-200/70 hover:text-white"
              >
                <X className="size-5" aria-hidden />
              </button>
              <DialogTitle className="text-base font-semibold">
                {dialogTitle}
              </DialogTitle>
              <DialogDescription className="sr-only">
                {dialogDescription}
              </DialogDescription>
              {stageContent}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </section>
  );
}
