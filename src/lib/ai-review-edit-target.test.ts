import { describe, expect, it } from "vitest";

import { resolveProfileEditTarget } from "./ai-review-edit-target";

const UUID = "11111111-2222-4333-8444-555555555555";

describe("resolveProfileEditTarget", () => {
  it("maps the professional summary to the basics section", () => {
    expect(resolveProfileEditTarget("basics:summary")).toEqual({
      section: "basics",
      entryId: null,
      href: "/candidate/profile?section=basics",
    });
  });

  it.each([
    ["work", `${UUID}:summary`, "work"],
    ["work", `${UUID}:highlight:2`, "work"],
    ["education", `${UUID}:highlight:0`, "education"],
    ["skill", `${UUID}:keyword:1`, "skills"],
    ["project", `${UUID}:description`, "projects"],
    ["project", `${UUID}:highlight:0`, "projects"],
  ])("maps %s block %s to section %s", (_prefix, suffix, section) => {
    const blockId = `${_prefix}:${suffix}`;
    const t = resolveProfileEditTarget(blockId);
    expect(t?.section).toBe(section);
    expect(t?.entryId).toBe(UUID);
    expect(t?.href).toBe(`/candidate/profile?section=${section}&entry=${UUID}`);
  });

  it.each([
    "",
    "blk-1",
    "work",
    `work:${UUID}`,
    `unknown:${UUID}:highlight:0`,
    `certification:${UUID}:name`,
    "basics",
    "basics:summary:extra",
    `work:not-a-uuid:highlight:0`,
    `work::highlight:0`,
  ])("returns null for unresolvable id %j", (blockId) => {
    expect(resolveProfileEditTarget(blockId)).toBeNull();
  });
});
