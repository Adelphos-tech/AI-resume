import { describe, expect, it } from "vitest";

import { readCustomTextContent } from "@/lib/career-site-blocks";

describe("readCustomTextContent", () => {
  it("reads NULL as uninitialized", () => {
    expect(readCustomTextContent(null)).toEqual({ kind: "empty" });
    expect(readCustomTextContent(undefined)).toEqual({ kind: "empty" });
  });

  it("reads persisted plain text", () => {
    expect(readCustomTextContent({ text: "Hello" })).toEqual({
      kind: "text",
      text: "Hello",
    });
  });

  it("preserves multiline text exactly", () => {
    expect(readCustomTextContent({ text: "First line\nSecond line" })).toEqual({
      kind: "text",
      text: "First line\nSecond line",
    });
  });

  it("reads an explicit empty string as saved text, not NULL", () => {
    expect(readCustomTextContent({ text: "" })).toEqual({
      kind: "text",
      text: "",
    });
  });

  it("fails safely on malformed content without crashing", () => {
    expect(readCustomTextContent({ html: "<b>x</b>" })).toEqual({
      kind: "invalid",
    });
    expect(readCustomTextContent("plain string")).toEqual({
      kind: "invalid",
    });
    expect(readCustomTextContent({ text: "x", color: "red" })).toEqual({
      kind: "invalid",
    });
  });
});
