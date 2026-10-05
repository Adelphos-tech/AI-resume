import { describe, expect, it } from "vitest";

import { moveBlock, readCustomTextContent } from "@/lib/career-site-blocks";

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

describe("moveBlock", () => {
  const ORDER = ["a", "b", "c"];

  it("swaps the block up one position", () => {
    expect(moveBlock(ORDER, 1, "up")).toEqual(["b", "a", "c"]);
  });

  it("swaps the block down one position", () => {
    expect(moveBlock(ORDER, 1, "down")).toEqual(["a", "c", "b"]);
  });

  it("first block cannot move up", () => {
    expect(moveBlock(ORDER, 0, "up")).toEqual(ORDER);
  });

  it("last block cannot move down", () => {
    expect(moveBlock(ORDER, 2, "down")).toEqual(ORDER);
  });

  it("single block stays unchanged in both directions", () => {
    expect(moveBlock(["a"], 0, "up")).toEqual(["a"]);
    expect(moveBlock(["a"], 0, "down")).toEqual(["a"]);
  });

  it("does not mutate the input array", () => {
    const order = ["a", "b", "c"];
    moveBlock(order, 1, "up");
    expect(order).toEqual(["a", "b", "c"]);
  });
});
