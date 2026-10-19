// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import { createElement } from "react";
import { render, cleanup } from "@testing-library/react";

import { useUnsavedChangesGuard } from "./use-unsaved-changes-guard";

function Host({ active }: { active: boolean }) {
  useUnsavedChangesGuard(active);
  return createElement(
    "div",
    null,
    createElement("a", { href: "/candidate", id: "internal" }, "Workspace"),
    createElement("a", { href: "#section", id: "samepage" }, "Same page"),
    createElement(
      "a",
      { href: "https://example.com/x", target: "_blank", id: "blank" },
      "New tab",
    ),
  );
}

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("useUnsavedChangesGuard", () => {
  it("prompts before in-app navigation while dirty", () => {
    const confirm = vi.spyOn(window, "confirm").mockReturnValue(false);
    render(createElement(Host, { active: true }));
    const link = document.getElementById("internal")!;
    const event = new MouseEvent("click", { bubbles: true, cancelable: true });
    link.dispatchEvent(event);
    expect(confirm).toHaveBeenCalledWith(
      "You have unsaved changes. Leave without saving?",
    );
    expect(event.defaultPrevented).toBe(true);
  });

  it("does not prompt when inactive (no unsaved changes)", () => {
    const confirm = vi.spyOn(window, "confirm").mockReturnValue(false);
    render(createElement(Host, { active: false }));
    document
      .getElementById("internal")!
      .dispatchEvent(new MouseEvent("click", { bubbles: true }));
    expect(confirm).not.toHaveBeenCalled();
  });

  it("ignores same-page and new-tab links", () => {
    const confirm = vi.spyOn(window, "confirm").mockReturnValue(false);
    render(createElement(Host, { active: true }));
    document
      .getElementById("samepage")!
      .dispatchEvent(new MouseEvent("click", { bubbles: true }));
    document
      .getElementById("blank")!
      .dispatchEvent(new MouseEvent("click", { bubbles: true }));
    expect(confirm).not.toHaveBeenCalled();
  });
});
