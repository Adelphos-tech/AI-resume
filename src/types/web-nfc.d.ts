/**
 * Minimal Web NFC typings — covers only what RoleRace uses.
 * Full spec: https://w3c.github.io/web-nfc/
 */

interface NDEFRecordInit {
  recordType: string;
  data?: unknown;
}

interface NDEFMessageInit {
  records: NDEFRecordInit[];
}

interface NDEFWriteOptions {
  signal?: AbortSignal;
}

interface NDEFScanOptions {
  signal?: AbortSignal;
}

interface NDEFRecord {
  recordType: string;
  // Per the Web NFC spec, records delivered via NDEFReadingEvent expose
  // `data` as a DataView (or absent for empty records).
  data?: DataView;
}

interface NDEFMessage {
  records: NDEFRecord[];
}

interface NDEFReadingEvent extends Event {
  message: NDEFMessage;
}

declare class NDEFReader {
  write(message: NDEFMessageInit, options?: NDEFWriteOptions): Promise<void>;
  scan(options?: NDEFScanOptions): Promise<void>;
  addEventListener(
    type: "reading",
    callback: (event: NDEFReadingEvent) => void,
  ): void;
  addEventListener(
    type: "readingerror",
    callback: (event: Event) => void,
  ): void;
  removeEventListener(
    type: "reading",
    callback: (event: NDEFReadingEvent) => void,
  ): void;
  removeEventListener(
    type: "readingerror",
    callback: (event: Event) => void,
  ): void;
}

interface Window {
  NDEFReader?: typeof NDEFReader;
}
