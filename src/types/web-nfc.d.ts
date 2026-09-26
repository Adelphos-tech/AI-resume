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

declare class NDEFReader {
  write(message: NDEFMessageInit, options?: NDEFWriteOptions): Promise<void>;
}

interface Window {
  NDEFReader?: typeof NDEFReader;
}
