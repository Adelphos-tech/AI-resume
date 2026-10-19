import { describe, it, expect } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { CareerCardSaveBar } from "./career-card-save-bar";

const noop = () => {};

describe("CareerCardSaveBar", () => {
  it("renders a Save Changes control in both placements", () => {
    const html = renderToStaticMarkup(
      createElement(CareerCardSaveBar, { status: "dirty", onSave: noop }),
    );
    const matches = html.match(/Save Changes/g);
    expect(matches?.length).toBe(2);
  });

  it("shows 'Unsaved changes' when dirty", () => {
    const html = renderToStaticMarkup(
      createElement(CareerCardSaveBar, { status: "dirty", onSave: noop }),
    );
    expect(html).toContain("Unsaved changes");
  });

  it("shows 'No unsaved changes' when clean", () => {
    const html = renderToStaticMarkup(
      createElement(CareerCardSaveBar, { status: "clean", onSave: noop }),
    );
    expect(html).toContain("No unsaved changes");
  });

  it("shows 'All changes saved' only for the saved state", () => {
    const saved = renderToStaticMarkup(
      createElement(CareerCardSaveBar, { status: "saved", onSave: noop }),
    );
    expect(saved).toContain("All changes saved");

    const dirty = renderToStaticMarkup(
      createElement(CareerCardSaveBar, { status: "dirty", onSave: noop }),
    );
    expect(dirty).not.toContain("All changes saved");
  });

  it("shows 'Saving…' while saving", () => {
    const html = renderToStaticMarkup(
      createElement(CareerCardSaveBar, { status: "saving", onSave: noop }),
    );
    expect(html).toContain("Saving…");
    expect(html).not.toContain("Save Changes");
  });

  it("shows the failure message on error and keeps Save enabled", () => {
    const html = renderToStaticMarkup(
      createElement(CareerCardSaveBar, {
        status: "error",
        message: "Network offline",
        onSave: noop,
      }),
    );
    expect(html).toContain("Couldn&#x27;t save");
    expect(html).toContain("Network offline");
    expect(html).toContain("Save Changes");
  });

  it("disables Save when there is nothing to save", () => {
    const html = renderToStaticMarkup(
      createElement(CareerCardSaveBar, { status: "clean", onSave: noop }),
    );
    expect(html.match(/disabled=""/g)?.length).toBe(2);
  });

  it("disables Save while saving (double-submit prevention)", () => {
    const html = renderToStaticMarkup(
      createElement(CareerCardSaveBar, { status: "saving", onSave: noop }),
    );
    expect(html.match(/disabled=""/g)?.length).toBe(2);
  });

  it("renders a Preview action on the top bar when provided", () => {
    const html = renderToStaticMarkup(
      createElement(CareerCardSaveBar, {
        status: "dirty",
        onSave: noop,
        onPreview: noop,
      }),
    );
    expect(html).toContain("Preview");
  });

  it("uses a sticky top bar on lg+ and a fixed bottom bar below lg", () => {
    const html = renderToStaticMarkup(
      createElement(CareerCardSaveBar, { status: "dirty", onSave: noop }),
    );
    expect(html).toContain("sticky top-3");
    expect(html).toContain("fixed inset-x-0 bottom-0");
  });
});
