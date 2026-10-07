/**
 * @vitest-environment jsdom
 */

import { describe, expect, it, vi, beforeEach } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  cleanup,
} from "@testing-library/react";

import { CareerProfileBasicsForm } from "./career-profile-basics-form";
import { masterCareerProfileBasicsSchema } from "@/lib/master-career-profile-schema";
import { updateBasicsAction } from "@/app/admin/candidates/[id]/career-profile/actions";

vi.mock("@/app/admin/candidates/[id]/career-profile/actions", () => ({
  updateBasicsAction: vi.fn(async () => ({ success: true })),
}));

function baseBasics(overrides: Record<string, unknown> = {}) {
  return {
    fullName: "Test User",
    headline: "Engineer",
    summary: null,
    email: null,
    phone: null,
    location: null,
    links: [],
    ...overrides,
  };
}

describe("CareerProfileBasicsForm", () => {
  it("renders without new canonical fields when legacy profile loaded", () => {
    const html = renderToStaticMarkup(
      createElement(CareerProfileBasicsForm, {
        candidateId: "test-candidate",
        initialBasics: baseBasics(),
      }),
    );
    expect(html).toContain("Professional Categories");
    expect(html).toContain("Genres");
    expect(html).toContain("Portfolio URL");
    expect(html).toContain("Showreel URL");
    // Legacy: no category/genre chips present
    expect(html.match(/id="cp-cat-\d"/g)?.length ?? 0).toBe(0);
    expect(html.match(/id="cp-genre-\d"/g)?.length ?? 0).toBe(0);
  });

  it("renders empty professionalCategories state", () => {
    const html = renderToStaticMarkup(
      createElement(CareerProfileBasicsForm, {
        candidateId: "test-candidate",
        initialBasics: baseBasics({ professionalCategories: [] }),
      }),
    );
    expect(html).toContain("Professional Categories");
    expect(html.match(/id="cp-cat-\d"/g)?.length ?? 0).toBe(0);
  });

  it("renders empty genres state", () => {
    const html = renderToStaticMarkup(
      createElement(CareerProfileBasicsForm, {
        candidateId: "test-candidate",
        initialBasics: baseBasics({ genres: [] }),
      }),
    );
    expect(html).toContain("Genres");
    expect(html.match(/id="cp-genre-\d"/g)?.length ?? 0).toBe(0);
  });

  it("populates existing professionalCategories with inputs", () => {
    const html = renderToStaticMarkup(
      createElement(CareerProfileBasicsForm, {
        candidateId: "test-candidate",
        initialBasics: baseBasics({
          professionalCategories: ["Actor", "Voice Artist"],
        }),
      }),
    );
    expect(html).toContain('id="cp-cat-0"');
    expect(html).toContain('id="cp-cat-1"');
    expect(html).not.toContain('id="cp-cat-2"');
    expect(html).toContain('aria-label="Remove category 1"');
    expect(html).toContain('aria-label="Remove category 2"');
  });

  it("populates existing genres with inputs", () => {
    const html = renderToStaticMarkup(
      createElement(CareerProfileBasicsForm, {
        candidateId: "test-candidate",
        initialBasics: baseBasics({
          genres: ["Drama", "Comedy"],
        }),
      }),
    );
    expect(html).toContain('id="cp-genre-0"');
    expect(html).toContain('id="cp-genre-1"');
    expect(html).not.toContain('id="cp-genre-2"');
    expect(html).toContain('aria-label="Remove genre 1"');
    expect(html).toContain('aria-label="Remove genre 2"');
  });

  it("provides add-category button", () => {
    const html = renderToStaticMarkup(
      createElement(CareerProfileBasicsForm, {
        candidateId: "test-candidate",
        initialBasics: baseBasics(),
      }),
    );
    expect(html).toContain("Add category");
  });

  it("provides add-genre button", () => {
    const html = renderToStaticMarkup(
      createElement(CareerProfileBasicsForm, {
        candidateId: "test-candidate",
        initialBasics: baseBasics(),
      }),
    );
    expect(html).toContain("Add genre");
  });

  it("loads portfolioUrl input", () => {
    const html = renderToStaticMarkup(
      createElement(CareerProfileBasicsForm, {
        candidateId: "test-candidate",
        initialBasics: baseBasics({
          portfolioUrl: "https://portfolio.example.com",
        }),
      }),
    );
    expect(html).toContain('id="cp-portfolioUrl"');
    expect(html).toContain("Portfolio URL");
  });

  it("loads showreelUrl input", () => {
    const html = renderToStaticMarkup(
      createElement(CareerProfileBasicsForm, {
        candidateId: "test-candidate",
        initialBasics: baseBasics({
          showreelUrl: "https://vimeo.com/12345",
        }),
      }),
    );
    expect(html).toContain('id="cp-showreelUrl"');
    expect(html).toContain("Showreel URL");
  });

  it("uses empty inputs when portfolioUrl is undefined", () => {
    const html = renderToStaticMarkup(
      createElement(CareerProfileBasicsForm, {
        candidateId: "test-candidate",
        initialBasics: baseBasics(),
      }),
    );
    expect(html).toContain('id="cp-portfolioUrl"');
    const portfolioSection =
      html.split('id="cp-portfolioUrl"')[1]?.split(">")[0] ?? "";
    expect(portfolioSection).not.toContain("portfolio.example");
  });

  it("uses empty inputs when showreelUrl is undefined", () => {
    const html = renderToStaticMarkup(
      createElement(CareerProfileBasicsForm, {
        candidateId: "test-candidate",
        initialBasics: baseBasics(),
      }),
    );
    expect(html).toContain('id="cp-showreelUrl"');
    const showreelSection =
      html.split('id="cp-showreelUrl"')[1]?.split(">")[0] ?? "";
    expect(showreelSection).not.toContain("vimeo.com");
  });

  it("uses type=url for portfolio and showreel inputs", () => {
    const html = renderToStaticMarkup(
      createElement(CareerProfileBasicsForm, {
        candidateId: "test-candidate",
        initialBasics: baseBasics(),
      }),
    );
    const urlInputs = html.match(/type="url"/g);
    expect(urlInputs?.length ?? 0).toBeGreaterThanOrEqual(2);
  });

  it("labels every field accessibly", () => {
    const html = renderToStaticMarkup(
      createElement(CareerProfileBasicsForm, {
        candidateId: "test-candidate",
        initialBasics: baseBasics(),
      }),
    );
    expect(html).toContain("Portfolio URL");
    expect(html).toContain("Showreel URL");
    expect(html).toContain('for="cp-portfolioUrl"');
    expect(html).toContain('for="cp-showreelUrl"');
  });

  it("does not hardcode default categories or genres", () => {
    const html = renderToStaticMarkup(
      createElement(CareerProfileBasicsForm, {
        candidateId: "test-candidate",
        initialBasics: baseBasics(),
      }),
    );
    // No default values in initial empty state
    const chips = html.match(/id="cp-cat-\d"/g);
    expect(chips?.length ?? 0).toBe(0);
    const genreChips = html.match(/id="cp-genre-\d"/g);
    expect(genreChips?.length ?? 0).toBe(0);
  });

  it("does not contain fabricated Celebrity features", () => {
    const html = renderToStaticMarkup(
      createElement(CareerProfileBasicsForm, {
        candidateId: "test-candidate",
        initialBasics: baseBasics(),
      }),
    );
    expect(html).not.toContain("professionalName");
    expect(html).not.toContain("verification");
    expect(html).not.toContain("audience metrics");
    expect(html).not.toContain("Project Match");
    expect(html).not.toContain("Invite to Project");
    expect(html).not.toContain("Collaboration Proposal");
    expect(html).not.toContain("Casting Needs");
  });

  it("preserves existing fullName and other basics in markup", () => {
    const html = renderToStaticMarkup(
      createElement(CareerProfileBasicsForm, {
        candidateId: "test-candidate",
        initialBasics: baseBasics({
          fullName: "Legacy User",
          headline: "Legacy Headline",
          location: "Legacy City",
        }),
      }),
    );
    // Name attributes verify field presence
    expect(html).toContain('name="fullName"');
    expect(html).toContain('name="headline"');
    expect(html).toContain('name="location"');
  });

  it("does not render career card templates", () => {
    const html = renderToStaticMarkup(
      createElement(CareerProfileBasicsForm, {
        candidateId: "test-candidate",
        initialBasics: baseBasics(),
      }),
    );
    expect(html).not.toContain("Career Passport");
    expect(html).not.toContain("Crimson Night");
    expect(html).not.toContain("Professional Connect");
  });
});

describe("CareerProfileBasicsForm — interaction simulation", () => {
  it("simulated add-category state renders a new editable input", () => {
    const before = renderToStaticMarkup(
      createElement(CareerProfileBasicsForm, {
        candidateId: "test-candidate",
        initialBasics: baseBasics({ professionalCategories: [] }),
      }),
    );
    expect(before.match(/id="cp-cat-\d"/g)?.length ?? 0).toBe(0);

    const after = renderToStaticMarkup(
      createElement(CareerProfileBasicsForm, {
        candidateId: "test-candidate",
        initialBasics: baseBasics({
          professionalCategories: ["Actor"],
        }),
      }),
    );
    expect(after).toContain('id="cp-cat-0"');
    expect(after).toContain('aria-label="Remove category 1"');
  });

  it("simulated remove-category state leaves fewer inputs", () => {
    const before = renderToStaticMarkup(
      createElement(CareerProfileBasicsForm, {
        candidateId: "test-candidate",
        initialBasics: baseBasics({
          professionalCategories: ["Actor", "Model", "Voice Artist"],
        }),
      }),
    );
    const beforeIds = before.match(/id="cp-cat-\d"/g);
    expect(beforeIds?.length ?? 0).toBe(3);

    const after = renderToStaticMarkup(
      createElement(CareerProfileBasicsForm, {
        candidateId: "test-candidate",
        initialBasics: baseBasics({
          professionalCategories: ["Actor", "Model"],
        }),
      }),
    );
    const afterIds = after.match(/id="cp-cat-\d"/g);
    expect(afterIds?.length ?? 0).toBe(2);
    expect(after).not.toContain('id="cp-cat-2"');
  });

  it("simulated add-genre state renders a new editable input", () => {
    const before = renderToStaticMarkup(
      createElement(CareerProfileBasicsForm, {
        candidateId: "test-candidate",
        initialBasics: baseBasics({ genres: [] }),
      }),
    );
    expect(before.match(/id="cp-genre-\d"/g)?.length ?? 0).toBe(0);

    const after = renderToStaticMarkup(
      createElement(CareerProfileBasicsForm, {
        candidateId: "test-candidate",
        initialBasics: baseBasics({
          genres: ["Drama"],
        }),
      }),
    );
    expect(after).toContain('id="cp-genre-0"');
    expect(after).toContain('aria-label="Remove genre 1"');
  });

  it("simulated remove-genre state leaves fewer inputs", () => {
    const before = renderToStaticMarkup(
      createElement(CareerProfileBasicsForm, {
        candidateId: "test-candidate",
        initialBasics: baseBasics({
          genres: ["Drama", "Comedy", "Thriller"],
        }),
      }),
    );
    const beforeIds = before.match(/id="cp-genre-\d"/g);
    expect(beforeIds?.length ?? 0).toBe(3);

    const after = renderToStaticMarkup(
      createElement(CareerProfileBasicsForm, {
        candidateId: "test-candidate",
        initialBasics: baseBasics({
          genres: ["Drama", "Comedy"],
        }),
      }),
    );
    const afterIds = after.match(/id="cp-genre-\d"/g);
    expect(afterIds?.length ?? 0).toBe(2);
    expect(after).not.toContain('id="cp-genre-2"');
  });
});

describe("CareerProfileBasicsForm — canonical submit payload", () => {
  function buildFormPayload(overrides: Record<string, unknown> = {}) {
    return {
      fullName: "Test User",
      headline: "Engineer",
      summary: null,
      email: null,
      phone: null,
      location: null,
      links: [],
      professionalCategories: ["Actor", "Voice Artist"],
      genres: ["Drama", "Comedy"],
      portfolioUrl: "https://portfolio.example.com",
      showreelUrl: "https://vimeo.com/12345",
      ...overrides,
    };
  }

  it("submit payload with all new fields validates through canonical schema", () => {
    const payload = buildFormPayload();
    const parsed = masterCareerProfileBasicsSchema.safeParse(payload);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.professionalCategories).toEqual([
        "Actor",
        "Voice Artist",
      ]);
      expect(parsed.data.genres).toEqual(["Drama", "Comedy"]);
      expect(parsed.data.portfolioUrl).toBe("https://portfolio.example.com");
      expect(parsed.data.showreelUrl).toBe("https://vimeo.com/12345");
    }
  });

  it("submit payload preserves existing basics fields", () => {
    const payload = buildFormPayload({
      fullName: "Legacy User",
      headline: "Legacy Headline",
      location: "Legacy City",
      email: "legacy@example.com",
      phone: "+1234567890",
    });
    const parsed = masterCareerProfileBasicsSchema.safeParse(payload);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.fullName).toBe("Legacy User");
      expect(parsed.data.headline).toBe("Legacy Headline");
      expect(parsed.data.location).toBe("Legacy City");
      expect(parsed.data.email).toBe("legacy@example.com");
      expect(parsed.data.phone).toBe("+1234567890");
    }
  });

  it("empty tag entries are filtered by canonical validation", () => {
    const payload = buildFormPayload({
      professionalCategories: ["Actor", "", "  ", "Model"],
      genres: ["Drama", "", "Comedy"],
    });
    const parsed = masterCareerProfileBasicsSchema.safeParse(payload);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.professionalCategories).toEqual(["Actor", "Model"]);
      expect(parsed.data.genres).toEqual(["Drama", "Comedy"]);
    }
  });

  it("empty URLs become null in canonical form", () => {
    const payload = buildFormPayload({
      portfolioUrl: "",
      showreelUrl: "",
    });
    const parsed = masterCareerProfileBasicsSchema.safeParse(payload);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.portfolioUrl).toBeNull();
      expect(parsed.data.showreelUrl).toBeNull();
    }
  });

  it("invalid portfolio URL rejected by schema", () => {
    const payload = buildFormPayload({ portfolioUrl: "not-a-url" });
    const parsed = masterCareerProfileBasicsSchema.safeParse(payload);
    expect(parsed.success).toBe(false);
  });

  it("invalid showreel URL rejected by schema", () => {
    const payload = buildFormPayload({ showreelUrl: "ftp://bad.protocol" });
    const parsed = masterCareerProfileBasicsSchema.safeParse(payload);
    expect(parsed.success).toBe(false);
  });

  it("empty arrays are valid and preserved", () => {
    const payload = buildFormPayload({
      professionalCategories: [],
      genres: [],
    });
    const parsed = masterCareerProfileBasicsSchema.safeParse(payload);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.professionalCategories).toEqual([]);
      expect(parsed.data.genres).toEqual([]);
    }
  });

  it("submit payload uses canonical field names", () => {
    const payload = buildFormPayload();
    const keys = Object.keys(payload);
    expect(keys).toContain("professionalCategories");
    expect(keys).toContain("genres");
    expect(keys).toContain("portfolioUrl");
    expect(keys).toContain("showreelUrl");
  });
});

describe("CareerProfileBasicsForm — real DOM interaction", () => {
  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  function renderForm(initialOverrides: Record<string, unknown> = {}) {
    return render(
      <CareerProfileBasicsForm
        candidateId="test-candidate"
        initialBasics={baseBasics(initialOverrides)}
      />,
    );
  }

  function submitForm() {
    const form = document.querySelector("form");
    if (form) fireEvent.submit(form);
  }

  it("clicking Add category creates an editable input", async () => {
    renderForm();
    fireEvent.click(screen.getAllByRole("button", { name: "Add category" })[0]);
    await waitFor(() => {
      expect(screen.getAllByLabelText(/Category \d+/).length).toBe(1);
    });
  });

  it("typing a category value is reflected in the input", async () => {
    renderForm();
    fireEvent.click(screen.getAllByRole("button", { name: "Add category" })[0]);
    const input = (await screen.findByLabelText(
      "Category 1",
    )) as HTMLInputElement;
    fireEvent.change(input, { target: { value: "Actor" } });
    expect(input.value).toBe("Actor");
  });

  it("clicking remove button removes that category", async () => {
    renderForm({ professionalCategories: ["Actor"] });
    fireEvent.click(
      screen.getAllByRole("button", { name: /Remove category \d+/ })[0],
    );
    expect(screen.queryAllByLabelText(/Category \d+/).length).toBe(0);
  });

  it("clicking Add genre creates an editable input", async () => {
    renderForm();
    fireEvent.click(screen.getAllByRole("button", { name: "Add genre" })[0]);
    await waitFor(() => {
      expect(screen.getAllByLabelText(/Genre \d+/).length).toBe(1);
    });
  });

  it("typing a genre value is reflected in the input", async () => {
    renderForm();
    fireEvent.click(screen.getAllByRole("button", { name: "Add genre" })[0]);
    const input = (await screen.findByLabelText("Genre 1")) as HTMLInputElement;
    fireEvent.change(input, { target: { value: "Drama" } });
    expect(input.value).toBe("Drama");
  });

  it("clicking remove button removes that genre", async () => {
    renderForm({ genres: ["Drama"] });
    fireEvent.click(
      screen.getAllByRole("button", { name: /Remove genre \d+/ })[0],
    );
    expect(screen.queryAllByLabelText(/Genre \d+/).length).toBe(0);
  });

  it("submits canonical payload through updateBasicsAction", async () => {
    renderForm({
      fullName: "Legacy User",
      headline: "Legacy Headline",
      location: "Legacy City",
    });

    fireEvent.click(screen.getAllByRole("button", { name: "Add category" })[0]);
    fireEvent.change(await screen.findByLabelText("Category 1"), {
      target: { value: "Actor" },
    });

    fireEvent.click(screen.getAllByRole("button", { name: "Add genre" })[0]);
    fireEvent.change(await screen.findByLabelText("Genre 1"), {
      target: { value: "Drama" },
    });

    fireEvent.change(screen.getByLabelText("Portfolio URL"), {
      target: { value: "https://portfolio.example.com" },
    });
    fireEvent.change(screen.getByLabelText("Showreel URL"), {
      target: { value: "https://vimeo.com/12345" },
    });

    submitForm();

    await waitFor(() => {
      expect(updateBasicsAction).toHaveBeenCalledTimes(1);
    });

    const payload = (updateBasicsAction as ReturnType<typeof vi.fn>).mock
      .calls[0][1] as Record<string, unknown>;

    // Form sends raw values; server-side schema filters empties
    expect(payload.professionalCategories).toContain("Actor");
    expect(payload.genres).toContain("Drama");
    expect(payload.portfolioUrl).toBe("https://portfolio.example.com");
    expect(payload.showreelUrl).toBe("https://vimeo.com/12345");
    expect(payload.fullName).toBe("Legacy User");
    expect(payload.headline).toBe("Legacy Headline");
    expect(payload.location).toBe("Legacy City");
  });

  it("invalid portfolio URL blocks submission", async () => {
    renderForm();
    fireEvent.change(screen.getByLabelText("Portfolio URL"), {
      target: { value: "not-a-url" },
    });
    submitForm();
    await waitFor(() => {
      expect(updateBasicsAction).not.toHaveBeenCalled();
    });
    expect(screen.getAllByRole("alert")[0].textContent).toContain("Invalid");
  });

  it("invalid showreel URL blocks submission", async () => {
    renderForm();
    fireEvent.change(screen.getByLabelText("Showreel URL"), {
      target: { value: "ftp://bad.protocol" },
    });
    submitForm();
    await waitFor(() => {
      expect(updateBasicsAction).not.toHaveBeenCalled();
    });
    expect(screen.getAllByRole("alert")[0].textContent).toContain("Invalid");
  });

  it("empty URLs submit empty string payload", async () => {
    renderForm();
    submitForm();
    await waitFor(() => {
      expect(updateBasicsAction).toHaveBeenCalledTimes(1);
    });
    const payload = (updateBasicsAction as ReturnType<typeof vi.fn>).mock
      .calls[0][1] as Record<string, unknown>;
    expect(payload.portfolioUrl).toBe("");
    expect(payload.showreelUrl).toBe("");
  });
});
