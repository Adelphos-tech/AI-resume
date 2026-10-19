// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createElement } from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  cleanup,
} from "@testing-library/react";

const saveProfile = vi.fn(
  async (raw: unknown): Promise<{ success: boolean; message?: string }> => {
    void raw;
    return { success: true };
  },
);
const saveCompany = vi.fn(
  async (raw: unknown): Promise<{ success: boolean; message?: string }> => {
    void raw;
    return { success: true };
  },
);

vi.mock("@/app/candidate/(workspace)/public-profile/actions", () => ({
  savePublicProfileSettingsAction: (raw: unknown) => saveProfile(raw),
  saveCompanyProfileAction: (raw: unknown) => saveCompany(raw),
  createPublicProfileAction: vi.fn(async () => ({ success: true })),
  publishPublicProfileAction: vi.fn(async () => ({ success: true })),
  unpublishPublicProfileAction: vi.fn(async () => ({ success: true })),
  updateSlugAction: vi.fn(async () => ({ success: true })),
  updatePhotoPositionAction: vi.fn(async () => ({ success: true })),
  updateCoverPositionAction: vi.fn(async () => ({ success: true })),
  removeProfilePhotoAction: vi.fn(async () => ({ success: true })),
  removeCoverPhotoAction: vi.fn(async () => ({ success: true })),
  removeCompanyLogoAction: vi.fn(async () => ({ success: true })),
}));

import { CareerCardBuilderPageClient } from "./career-card-builder-client";
import { EMPTY_COMPANY } from "./company-profile-settings";
import type { PublicProfileSettingsState } from "./public-profile-settings";

const PROFILE: PublicProfileSettingsState = {
  publicHeadline: "Old Headline",
  publicBio: "",
  publicLocation: "",
  currentFocus: "",
  workAuthorization: "",
  openToOpportunities: false,
  linkedinUrl: "",
  githubUrl: "",
  websiteUrl: "",
  whatsappNumber: "",
  whatsappCountry: "",
  showWhatsapp: false,
  showExperience: false,
  showEducation: false,
  showSkills: false,
  showProjects: false,
  showCertifications: false,
  showLanguages: false,
  featuredResumeVariantId: "",
  themeId: "role-race-classic",
  accentColorId: "emerald",
  cardStyleId: "standard",
  nfcCompactSkinId: "career-passport",
};

const PROPS = {
  initialState: PROFILE,
  slug: "qa-slug",
  isPublished: false,
  shareUrl: null as string | null,
  publicUrl: "/u/qa-slug",
  variants: [] as {
    id: string;
    name: string;
    targetRole: string;
    targetCountry: string;
  }[],
  photoUrl: null as string | null,
  displayName: "QA User",
  photoKey: null as string | null,
  photoPosition: { focalX: 0.5, focalY: 0.5, zoom: 1 },
  coverUrl: null as string | null,
  coverKey: null as string | null,
  coverPosition: { focalX: 0.5, focalY: 0.5, zoom: 1 },
  companyInitial: null as typeof EMPTY_COMPANY | null,
  logoUrl: null as string | null,
};

function saveButtons() {
  return screen.getAllByRole("button", { name: /^save changes$/i });
}
function clickSave() {
  fireEvent.click(saveButtons()[0]);
}
async function waitForSave() {
  await waitFor(() =>
    expect(screen.getAllByText(/all changes saved/i).length).toBeGreaterThan(0),
  );
}

beforeEach(() => {
  saveProfile.mockReset().mockResolvedValue({ success: true });
  saveCompany.mockReset().mockResolvedValue({ success: true });
});
afterEach(cleanup);

describe("global save bar", () => {
  it("starts clean when nothing was edited", () => {
    render(createElement(CareerCardBuilderPageClient, PROPS));
    expect(screen.getAllByText("No unsaved changes").length).toBeGreaterThan(0);
    for (const b of saveButtons())
      expect((b as HTMLButtonElement).disabled).toBe(true);
  });

  it("flags unsaved changes after an edit on Basics", async () => {
    render(createElement(CareerCardBuilderPageClient, PROPS));
    fireEvent.change(document.getElementById("pp-headline")!, {
      target: { value: "New Headline" },
    });
    await waitFor(() =>
      expect(screen.getAllByText("Unsaved changes").length).toBeGreaterThan(0),
    );
  });

  it("saves profile edits from the Basics section", async () => {
    render(createElement(CareerCardBuilderPageClient, PROPS));
    fireEvent.change(document.getElementById("pp-headline")!, {
      target: { value: "New Headline" },
    });
    clickSave();
    await waitFor(() => expect(saveProfile).toHaveBeenCalledTimes(1));
    expect(saveProfile.mock.calls[0][0]).toMatchObject({
      publicHeadline: "New Headline",
      themeId: "role-race-classic",
    });
    await waitForSave();
  });

  it("saves theme changes from the Design section", async () => {
    render(createElement(CareerCardBuilderPageClient, PROPS));
    fireEvent.click(screen.getByRole("tab", { name: "Design" }));
    fireEvent.click(screen.getByRole("radio", { name: /tech minimal/i }));
    clickSave();
    await waitFor(() => expect(saveProfile).toHaveBeenCalledTimes(1));
    expect(saveProfile.mock.calls[0][0]).toMatchObject({
      themeId: "tech-minimal",
      publicHeadline: "Old Headline",
    });
    await waitForSave();
  });

  it("saves company details from the Company section", async () => {
    render(createElement(CareerCardBuilderPageClient, PROPS));
    fireEvent.click(screen.getByRole("tab", { name: "Company" }));
    fireEvent.change(document.getElementById("cp-name")!, {
      target: { value: "Acme Ltd" },
    });
    clickSave();
    await waitFor(() => expect(saveCompany).toHaveBeenCalledTimes(1));
    expect(saveCompany.mock.calls[0][0]).toMatchObject({
      companyName: "Acme Ltd",
    });
    expect(saveProfile).not.toHaveBeenCalled();
    await waitForSave();
  });

  it("saves profile and company together when both are dirty", async () => {
    render(createElement(CareerCardBuilderPageClient, PROPS));
    fireEvent.change(document.getElementById("pp-headline")!, {
      target: { value: "New Headline" },
    });
    fireEvent.click(screen.getByRole("tab", { name: "Company" }));
    fireEvent.change(document.getElementById("cp-name")!, {
      target: { value: "Acme Ltd" },
    });
    clickSave();
    await waitFor(() => {
      expect(saveProfile).toHaveBeenCalledTimes(1);
      expect(saveCompany).toHaveBeenCalledTimes(1);
    });
    await waitForSave();
  });

  it("rejects a dirty company form with an empty name and keeps the input", async () => {
    render(
      createElement(CareerCardBuilderPageClient, {
        ...PROPS,
        companyInitial: { ...EMPTY_COMPANY, companyName: "Acme" },
      }),
    );
    fireEvent.click(screen.getByRole("tab", { name: "Company" }));
    fireEvent.change(document.getElementById("cp-name")!, {
      target: { value: "" },
    });
    clickSave();
    await waitFor(() =>
      expect(screen.getAllByText(/couldn.t save/i).length).toBeGreaterThan(0),
    );
    expect(screen.getAllByText(/add a company name/i).length).toBeGreaterThan(
      0,
    );
    expect(saveCompany).not.toHaveBeenCalled();
    expect((document.getElementById("cp-name") as HTMLInputElement).value).toBe(
      "",
    );
  });

  it("shows the server error and does not lose input on a failed save", async () => {
    saveProfile.mockResolvedValueOnce({
      success: false,
      message: "Storage offline",
    });
    render(createElement(CareerCardBuilderPageClient, PROPS));
    fireEvent.change(document.getElementById("pp-headline")!, {
      target: { value: "New Headline" },
    });
    clickSave();
    await waitFor(() =>
      expect(screen.getAllByText(/couldn.t save/i).length).toBeGreaterThan(0),
    );
    expect(screen.getAllByText(/storage offline/i).length).toBeGreaterThan(0);
    expect(
      (document.getElementById("pp-headline") as HTMLInputElement).value,
    ).toBe("New Headline");
    // Save stays enabled so the user can retry.
    for (const b of saveButtons())
      expect((b as HTMLButtonElement).disabled).toBe(false);
  });

  it("prevents duplicate submissions while a save is in flight", async () => {
    let resolveSave: (v: { success: boolean }) => void = () => {};
    saveProfile.mockImplementation(
      () =>
        new Promise((res) => {
          resolveSave = res;
        }),
    );
    render(createElement(CareerCardBuilderPageClient, PROPS));
    fireEvent.change(document.getElementById("pp-headline")!, {
      target: { value: "New Headline" },
    });
    for (const b of saveButtons()) fireEvent.click(b);
    expect(saveProfile).toHaveBeenCalledTimes(1);
    resolveSave({ success: true });
    await waitForSave();
  });

  it("keeps unsaved edits when switching sections", async () => {
    render(createElement(CareerCardBuilderPageClient, PROPS));
    fireEvent.change(document.getElementById("pp-headline")!, {
      target: { value: "New Headline" },
    });
    fireEvent.click(screen.getByRole("tab", { name: "Design" }));
    fireEvent.click(screen.getByRole("tab", { name: "Basics" }));
    expect(
      (document.getElementById("pp-headline") as HTMLInputElement).value,
    ).toBe("New Headline");
    expect(screen.getAllByText("Unsaved changes").length).toBeGreaterThan(0);
  });

  it("marks state saved only after persistence succeeds", async () => {
    render(createElement(CareerCardBuilderPageClient, PROPS));
    fireEvent.change(document.getElementById("pp-headline")!, {
      target: { value: "New Headline" },
    });
    clickSave();
    await waitForSave();
    // saved snapshot updated → no longer dirty, Save disabled again
    expect(screen.queryAllByText("Unsaved changes")).toHaveLength(0);
    for (const b of saveButtons())
      expect((b as HTMLButtonElement).disabled).toBe(true);
    // A new edit flips it back to dirty
    fireEvent.change(document.getElementById("pp-headline")!, {
      target: { value: "Newer Headline" },
    });
    await waitFor(() =>
      expect(screen.getAllByText("Unsaved changes").length).toBeGreaterThan(0),
    );
  });
});
