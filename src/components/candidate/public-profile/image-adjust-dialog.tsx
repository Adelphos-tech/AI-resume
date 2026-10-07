"use client";

import { useCallback, useState } from "react";
import Cropper from "react-easy-crop";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";

export type ImageAdjustMode = "profile" | "cover";

export type ImageAdjustDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageUrl: string;
  mode: ImageAdjustMode;
  /** RoleRace persisted focal point (0–1). 0.5 = center. */
  initialFocalX: number;
  initialFocalY: number;
  /** RoleRace persisted zoom (1–2.5). */
  initialZoom: number;
  busy: boolean;
  message: string | null;
  onSave: (focalX: number, focalY: number, zoom: number) => void;
};

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

/** Convert RoleRace focal point to react-easy-crop initial crop. */
function focalToCrop(focalX: number, focalY: number) {
  return {
    x: (0.5 - clamp01(focalX)) * 100,
    y: (0.5 - clamp01(focalY)) * 100,
  };
}

/** Convert react-easy-crop crop to RoleRace focal point. */
function cropToFocal(cropX: number, cropY: number) {
  return {
    focalX: clamp01(0.5 - cropX / 100),
    focalY: clamp01(0.5 - cropY / 100),
  };
}

export function ImageAdjustDialog({
  open,
  onOpenChange,
  imageUrl,
  mode,
  initialFocalX,
  initialFocalY,
  initialZoom,
  busy,
  message,
  onSave,
}: ImageAdjustDialogProps) {
  const initialCrop = focalToCrop(initialFocalX, initialFocalY);
  const [crop, setCrop] = useState({ x: initialCrop.x, y: initialCrop.y });
  const [zoom, setZoom] = useState(initialZoom);

  const handleCropChange = useCallback((next: { x: number; y: number }) => {
    setCrop(next);
  }, []);

  const handleZoomChange = useCallback((next: number) => {
    setZoom(next);
  }, []);

  const handleReset = useCallback(() => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
  }, []);

  const handleSave = useCallback(() => {
    const { focalX, focalY } = cropToFocal(crop.x, crop.y);
    onSave(focalX, focalY, zoom);
  }, [crop, zoom, onSave]);

  const handleCancel = useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  const isProfile = mode === "profile";
  const title = isProfile ? "Adjust profile photo" : "Adjust cover photo";
  const description = isProfile
    ? "Drag to reposition your photo. Use the zoom slider to zoom in or out."
    : "Drag to reposition your cover. Use the zoom slider to zoom in or out.";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-lg rounded-2xl border-stone-200 p-6"
        aria-describedby={undefined}
      >
        <DialogTitle className="text-base font-semibold">{title}</DialogTitle>
        <DialogDescription className="text-sm text-stone-500">
          {description}
        </DialogDescription>

        {/* Cropper container — fixed dimensions so react-easy-crop measures
            correctly on first mount inside the dialog. */}
        <div className="mt-4 flex justify-center">
          <div
            className="relative overflow-hidden rounded-2xl ring-1 ring-stone-200"
            style={{
              width: isProfile ? 280 : 480,
              height: isProfile ? 280 : 240,
            }}
          >
            <Cropper
              image={imageUrl}
              crop={crop}
              zoom={zoom}
              aspect={isProfile ? 1 : 2}
              cropShape={isProfile ? "round" : "rect"}
              showGrid={false}
              onCropChange={handleCropChange}
              onZoomChange={handleZoomChange}
              onCropComplete={() => {}}
              style={{
                containerStyle: {
                  width: isProfile ? 280 : 480,
                  height: isProfile ? 280 : 240,
                },
              }}
            />
          </div>
        </div>
        <p className="mt-2 text-center text-xs text-stone-400">
          Drag to reposition
        </p>

        {/* Zoom slider */}
        <div className="mt-4">
          <div className="flex items-center gap-3">
            <label
              htmlFor="adjust-zoom"
              className="w-12 shrink-0 text-xs font-medium text-stone-600"
            >
              Zoom
            </label>
            <input
              id="adjust-zoom"
              type="range"
              min={1}
              max={2.5}
              step={0.05}
              value={zoom}
              aria-label="Zoom"
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-full accent-emerald-700"
            />
          </div>
        </div>

        {message && (
          <p role="alert" className="mt-3 text-sm text-red-600">
            {message}
          </p>
        )}

        <div className="mt-5 flex items-center justify-between">
          <button
            type="button"
            onClick={handleReset}
            disabled={busy}
            className="text-sm font-semibold text-stone-600 transition-colors hover:text-stone-900 disabled:opacity-50"
          >
            Reset
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCancel}
              disabled={busy}
              className="inline-flex min-h-10 items-center rounded-xl border border-stone-200 px-4 py-2 text-sm font-semibold text-stone-600 transition-colors hover:border-stone-300 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={busy}
              className="inline-flex min-h-10 items-center rounded-xl bg-emerald-700 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-800 disabled:opacity-50"
            >
              {busy ? "Saving…" : "Save"}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
