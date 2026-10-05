"use client";

import { useRef, useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";

export type PhotoPosition = { focalX: number; focalY: number; zoom: number };

export const DEFAULT_PHOTO_POSITION: PhotoPosition = {
  focalX: 0.5,
  focalY: 0.5,
  zoom: 1,
};

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const clampZoom = (v: number) => Math.min(2.5, Math.max(1, v));

/**
 * Shared non-destructive photo renderer — the single positioning
 * implementation used by the settings preview, the editor, and the public
 * Career Card. The stored WebP master is never modified: focal point is
 * applied via object-position and zoom via transform scale.
 */
export function CareerCardProfilePhoto({
  src,
  alt,
  position,
  frameClassName,
}: {
  src: string;
  alt: string;
  position: PhotoPosition;
  /** Theme/parent frame: size, shape, ring — overflow-hidden is enforced. */
  frameClassName: string;
}) {
  const { focalX, focalY, zoom } = position;
  return (
    <div
      className={`relative overflow-hidden ${frameClassName}`}
      aria-hidden={alt ? undefined : true}
    >
      {/* Same image bytes — presentation only; centered crop by default. */}
      <img
        src={src}
        alt={alt}
        draggable={false}
        className="pointer-events-none absolute inset-0 size-full object-cover select-none"
        style={{
          objectPosition: `${focalX * 100}% ${focalY * 100}%`,
          transform: `scale(${zoom})`,
          transformOrigin: `${focalX * 100}% ${focalY * 100}%`,
        }}
      />
    </div>
  );
}

/**
 * Focused photo-position editor — pointer-drag + three accessible sliders
 * (horizontal, vertical, zoom). Edits a local copy; Save persists through
 * the parent handler; Cancel/× discards. No crop touches the stored image.
 */
export function PhotoPositionEditor({
  src,
  name,
  initial,
  busy,
  message,
  onClose,
  onSave,
}: {
  src: string;
  name: string;
  initial: PhotoPosition;
  busy: boolean;
  message: string | null;
  onClose: () => void;
  onSave: (position: PhotoPosition) => void;
}) {
  // Editor mounts only while open — useState seeds the persisted position
  // for each fresh editing session.
  const [pos, setPos] = useState<PhotoPosition>(initial);
  const frameRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ x: number; y: number; from: PhotoPosition } | null>(
    null,
  );

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = { x: e.clientX, y: e.clientY, from: pos };
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    const frame = frameRef.current;
    if (!drag || !frame) return;
    const rect = frame.getBoundingClientRect();
    // Dragging the photo left/up reveals the right/lower area → focal moves
    // the opposite direction. Sensitivity scales down as zoom increases.
    const gain = 1 / drag.from.zoom;
    setPos({
      focalX: clamp01(
        drag.from.focalX - ((e.clientX - drag.x) / rect.width) * gain,
      ),
      focalY: clamp01(
        drag.from.focalY - ((e.clientY - drag.y) / rect.height) * gain,
      ),
      zoom: drag.from.zoom,
    });
  };

  const endDrag = () => {
    dragRef.current = null;
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="max-w-sm rounded-2xl border-stone-200 p-6"
        aria-describedby={undefined}
      >
        <DialogTitle className="text-base font-semibold">
          Adjust profile photo
        </DialogTitle>
        <DialogDescription className="text-sm text-stone-500">
          Drag the photo to reposition it, or use the sliders.
        </DialogDescription>

        {/* preview frame — square, drag target */}
        <div className="mt-4 flex justify-center">
          <div
            ref={frameRef}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
            className="cursor-grab touch-none rounded-2xl ring-1 ring-stone-200 active:cursor-grabbing"
            role="presentation"
          >
            <CareerCardProfilePhoto
              src={src}
              alt=""
              position={pos}
              frameClassName="size-[min(70vw,300px)]"
            />
          </div>
        </div>
        <p className="mt-2 text-center text-xs text-stone-400">
          Drag photo to reposition
        </p>

        <div className="mt-4 space-y-3">
          {(
            [
              ["pp-pos-x", "Horizontal position", "focalX", 0, 1, 0.01],
              ["pp-pos-y", "Vertical position", "focalY", 0, 1, 0.01],
              ["pp-pos-zoom", "Zoom", "zoom", 1, 2.5, 0.05],
            ] as const
          ).map(([id, label, key, min, max, step]) => (
            <div key={id} className="flex items-center gap-3">
              <label
                htmlFor={id}
                className="w-28 shrink-0 text-xs font-medium text-stone-600"
              >
                {label}
              </label>
              <input
                id={id}
                type="range"
                min={min}
                max={max}
                step={step}
                value={pos[key]}
                aria-label={label}
                onChange={(e) =>
                  setPos((s) => ({
                    ...s,
                    [key]:
                      key === "zoom"
                        ? clampZoom(Number(e.target.value))
                        : clamp01(Number(e.target.value)),
                  }))
                }
                className="w-full accent-emerald-700"
              />
            </div>
          ))}
        </div>

        {message && (
          <p role="alert" className="mt-3 text-sm text-red-600">
            {message}
          </p>
        )}

        <div className="mt-5 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setPos(DEFAULT_PHOTO_POSITION)}
            disabled={busy}
            className="text-sm font-semibold text-stone-600 transition-colors hover:text-stone-900 disabled:opacity-50"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={() => onSave(pos)}
            disabled={busy}
            className="inline-flex min-h-10 items-center rounded-xl bg-emerald-700 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-800 disabled:opacity-50"
          >
            {busy ? "Saving…" : "Save"}
          </button>
        </div>
        <span className="sr-only">{name} profile photo editor</span>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Shared non-destructive cover renderer — the single positioning
 * implementation used by the settings preview, the cover editor, and the
 * public Career Card across all four themes. The stored WebP master is
 * never modified: focal point via object-position, zoom via transform
 * scale anchored at the same focal point (which keeps the frame covered —
 * zoom scales outward from the focal, so no empty space is revealed).
 */
export function CareerCardCoverPhoto({
  src,
  alt,
  position,
  frameClassName,
}: {
  src: string;
  alt: string;
  position: PhotoPosition;
  /** Theme frame: height, rounding — overflow-hidden is enforced. */
  frameClassName: string;
}) {
  const { focalX, focalY, zoom } = position;
  return (
    <div
      className={`relative overflow-hidden ${frameClassName}`}
      aria-hidden={alt ? undefined : true}
    >
      <img
        src={src}
        alt={alt}
        draggable={false}
        className="pointer-events-none absolute inset-0 size-full object-cover select-none"
        style={{
          objectPosition: `${focalX * 100}% ${focalY * 100}%`,
          transform: `scale(${zoom})`,
          transformOrigin: `${focalX * 100}% ${focalY * 100}%`,
        }}
      />
    </div>
  );
}

/**
 * Cover-position editor — pointer-drag on a wide preview + three
 * accessible sliders. Edits a local copy; Save persists through the
 * parent handler; Cancel/× discards. The stored image is never touched.
 */
export function CoverPositionEditor({
  src,
  name,
  initial,
  busy,
  message,
  onClose,
  onSave,
  frameClassName = "aspect-2/1 w-full",
}: {
  src: string;
  name: string;
  initial: PhotoPosition;
  busy: boolean;
  message: string | null;
  onClose: () => void;
  onSave: (position: PhotoPosition) => void;
  /** Theme-aware frame class — defaults to the legacy 2:1 ratio. */
  frameClassName?: string;
}) {
  const [pos, setPos] = useState<PhotoPosition>(initial);
  const frameRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ x: number; y: number; from: PhotoPosition } | null>(
    null,
  );

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = { x: e.clientX, y: e.clientY, from: pos };
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    const frame = frameRef.current;
    if (!drag || !frame) return;
    const rect = frame.getBoundingClientRect();
    // Dragging the cover left/up reveals the right/lower area → focal moves
    // the opposite direction. Sensitivity scales down as zoom increases.
    const gain = 1 / drag.from.zoom;
    setPos({
      focalX: clamp01(
        drag.from.focalX - ((e.clientX - drag.x) / rect.width) * gain,
      ),
      focalY: clamp01(
        drag.from.focalY - ((e.clientY - drag.y) / rect.height) * gain,
      ),
      zoom: drag.from.zoom,
    });
  };

  const endDrag = () => {
    dragRef.current = null;
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="max-w-md rounded-2xl border-stone-200 p-6"
        aria-describedby={undefined}
      >
        <DialogTitle className="text-base font-semibold">
          Adjust cover photo
        </DialogTitle>
        <DialogDescription className="text-sm text-stone-500">
          Drag the cover to reposition it, or use the sliders.
        </DialogDescription>

        {/* preview frame — theme-aware, drag target */}
        <div className="mt-4">
          <div
            ref={frameRef}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
            className="cursor-grab touch-none overflow-hidden rounded-2xl ring-1 ring-stone-200 active:cursor-grabbing"
            role="presentation"
          >
            <CareerCardCoverPhoto
              src={src}
              alt=""
              position={pos}
              frameClassName={frameClassName}
            />
          </div>
        </div>
        <p className="mt-2 text-center text-xs text-stone-400">
          Drag image to reposition
        </p>

        <div className="mt-4 space-y-3">
          {(
            [
              ["cv-pos-x", "Horizontal position", "focalX", 0, 1, 0.01],
              ["cv-pos-y", "Vertical position", "focalY", 0, 1, 0.01],
              ["cv-pos-zoom", "Zoom", "zoom", 1, 2.5, 0.05],
            ] as const
          ).map(([id, label, key, min, max, step]) => (
            <div key={id} className="flex items-center gap-3">
              <label
                htmlFor={id}
                className="w-28 shrink-0 text-xs font-medium text-stone-600"
              >
                {label}
              </label>
              <input
                id={id}
                type="range"
                min={min}
                max={max}
                step={step}
                value={pos[key]}
                aria-label={label}
                onChange={(e) =>
                  setPos((s) => ({
                    ...s,
                    [key]:
                      key === "zoom"
                        ? clampZoom(Number(e.target.value))
                        : clamp01(Number(e.target.value)),
                  }))
                }
                className="w-full accent-emerald-700"
              />
            </div>
          ))}
        </div>

        {message && (
          <p role="alert" className="mt-3 text-sm text-red-600">
            {message}
          </p>
        )}

        <div className="mt-5 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setPos(DEFAULT_PHOTO_POSITION)}
            disabled={busy}
            className="text-sm font-semibold text-stone-600 transition-colors hover:text-stone-900 disabled:opacity-50"
          >
            Reset
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={busy}
              className="inline-flex min-h-10 items-center rounded-xl border border-stone-200 px-4 py-2 text-sm font-semibold text-stone-600 transition-colors hover:border-stone-300 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => onSave(pos)}
              disabled={busy}
              className="inline-flex min-h-10 items-center rounded-xl bg-emerald-700 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-800 disabled:opacity-50"
            >
              {busy ? "Saving…" : "Save"}
            </button>
          </div>
        </div>
        <span className="sr-only">{name} cover photo editor</span>
      </DialogContent>
    </Dialog>
  );
}
