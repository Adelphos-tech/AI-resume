"use client";

import { Plus, Trash2 } from "lucide-react";
import { useRef, useState, useTransition } from "react";

import {
  removeCompanyLogoAction,
  saveCompanyProfileAction,
} from "@/app/candidate/(workspace)/public-profile/actions";
import { Button } from "@/components/ui/button";
import { WhatsappCountrySelect } from "@/components/candidate/public-profile/whatsapp-fields";
import { CareerCardCompanyIdentitySettings } from "@/components/candidate/public-profile/career-card-company-identity-settings";

export type CompanyProfileState = {
  companyName: string;
  tagline: string;
  contactPersonName: string;
  contactPersonRole: string;
  publicPhone: string;
  publicEmail: string;
  whatsappNumber: string;
  whatsappCountry: string;
  websiteUrl: string;
  linkedinUrl: string;
  facebookUrl: string;
  instagramUrl: string;
  xUrl: string;
  youtubeUrl: string;
  tiktokUrl: string;
  about: string;
  industry: string;
  locations: string[];
  services: string[];
  hiringOpen: boolean;
  openRolesSummary: string;
  openRolesUrl: string;
  companyProfileSummary: string;
  companyProfileUrl: string;
  showPublicPhone: boolean;
  showPublicEmail: boolean;
  showWhatsapp: boolean;
  showContactPerson: boolean;
  isVisible: boolean;
};

export const EMPTY_COMPANY: CompanyProfileState = {
  companyName: "",
  tagline: "",
  contactPersonName: "",
  contactPersonRole: "",
  publicPhone: "",
  publicEmail: "",
  whatsappNumber: "",
  whatsappCountry: "",
  websiteUrl: "",
  linkedinUrl: "",
  facebookUrl: "",
  instagramUrl: "",
  xUrl: "",
  youtubeUrl: "",
  tiktokUrl: "",
  about: "",
  industry: "",
  locations: [],
  services: [],
  hiringOpen: false,
  openRolesSummary: "",
  openRolesUrl: "",
  companyProfileSummary: "",
  companyProfileUrl: "",
  showPublicPhone: false,
  showPublicEmail: false,
  showWhatsapp: false,
  showContactPerson: false,
  isVisible: false,
};

const inputCls =
  "w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm text-stone-900 placeholder:text-stone-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20";
const labelCls = "text-xs font-semibold uppercase tracking-wide text-stone-500";
const groupCls = "rounded-2xl border border-stone-200 bg-white p-6 space-y-5";
const groupTitleCls = "text-sm font-semibold text-stone-900";
const groupDescCls = "mt-0.5 text-xs text-stone-500";

function Toggle({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  description?: string;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 size-4 rounded border-stone-300 accent-emerald-700"
      />
      <span>
        <span className="block text-sm font-medium text-stone-900">
          {label}
        </span>
        {description && (
          <span className="mt-0.5 block text-xs text-stone-500">
            {description}
          </span>
        )}
      </span>
    </label>
  );
}

function ListEditor({
  label,
  items,
  addLabel,
  onChange,
}: {
  label: string;
  items: string[];
  addLabel: string;
  onChange: (next: string[]) => void;
}) {
  const [draft, setDraft] = useState("");
  const add = () => {
    const v = draft.trim();
    if (!v) return;
    onChange([...items, v]);
    setDraft("");
  };
  return (
    <div>
      <p className={labelCls}>{label}</p>
      <div className="mt-2 space-y-2">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              value={item}
              onChange={(e) =>
                onChange(items.map((x, j) => (j === i ? e.target.value : x)))
              }
              className={inputCls}
            />
            <button
              type="button"
              aria-label={`Remove ${label.toLowerCase()}`}
              onClick={() => onChange(items.filter((_, j) => j !== i))}
              className="grid size-9 shrink-0 place-items-center rounded-lg border border-stone-200 text-stone-400 transition hover:border-red-200 hover:text-red-600"
            >
              <Trash2 className="size-4" aria-hidden />
            </button>
          </div>
        ))}
        <div className="flex items-center gap-2">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                add();
              }
            }}
            placeholder={addLabel}
            className={inputCls}
          />
          <button
            type="button"
            onClick={add}
            className="grid size-9 shrink-0 place-items-center rounded-lg border border-dashed border-stone-300 text-stone-500 transition hover:border-emerald-400 hover:text-emerald-700"
            aria-label={`Add ${label.toLowerCase()}`}
          >
            <Plus className="size-4" aria-hidden />
          </button>
        </div>
      </div>
    </div>
  );
}

export function CompanyProfileSettings({
  initial,
  logoUrl,
}: {
  initial: CompanyProfileState | null;
  logoUrl: string | null;
}) {
  const [form, setForm] = useState<CompanyProfileState>(
    initial ?? EMPTY_COMPANY,
  );
  const [savedForm, setSavedForm] = useState<CompanyProfileState>(
    initial ?? EMPTY_COMPANY,
  );
  const [logo, setLogo] = useState<string | null>(logoUrl);
  const [logoMsg, setLogoMsg] = useState<string | null>(null);
  const [logoBusy, setLogoBusy] = useState(false);
  const [logoV, setLogoV] = useState(0);
  const logoRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  const set = <K extends keyof CompanyProfileState>(
    key: K,
    value: CompanyProfileState[K],
  ) => setForm((f) => ({ ...f, [key]: value }));

  async function onLogoSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setLogoMsg(null);
    setLogoBusy(true);
    try {
      const fd = new FormData();
      fd.append("logo", file);
      const res = await fetch("/api/candidate/company-profile/logo", {
        method: "POST",
        body: fd,
      });
      const r: { success: boolean; logoUrl?: string; message?: string } =
        await res.json().catch(() => ({ success: false }));
      if (!r.success) setLogoMsg(r.message ?? "Upload failed. Try again.");
      else {
        setLogo(r.logoUrl ?? null);
        setLogoV((v) => v + 1);
        setLogoMsg("Logo updated");
      }
    } catch {
      setLogoMsg("Upload failed. Try again.");
    } finally {
      setLogoBusy(false);
    }
  }

  async function onRemoveLogo() {
    setLogoMsg(null);
    setLogoBusy(true);
    try {
      const r = await removeCompanyLogoAction();
      if (!r.success) setLogoMsg("Something went wrong.");
      else {
        setLogo(null);
        setLogoMsg("Logo removed");
      }
    } finally {
      setLogoBusy(false);
    }
  }

  function save() {
    setError(null);
    setSaved(false);
    startTransition(async () => {
      const r = await saveCompanyProfileAction(form);
      if (!r.success) setError(r.message ?? "Something went wrong.");
      else {
        setSaved(true);
        setSavedForm(form);
      }
    });
  }

  const dirty = JSON.stringify(form) !== JSON.stringify(savedForm);
  const hasSavedRow = initial !== null || saved;
  const hintCls = "mt-1.5 text-xs";
  const privateHint = (
    <p className={`${hintCls} text-stone-500`}>
      Saved privately — not shown publicly.
    </p>
  );
  const publicHint = (
    <p className={`${hintCls} text-emerald-700`}>Shown publicly.</p>
  );

  return (
    <section
      aria-labelledby="cp-title"
      className="rounded-2xl border border-stone-200 bg-white p-6"
    >
      <h2 id="cp-title" className="text-base font-semibold text-stone-900">
        Company
      </h2>
      <p className="mt-1 text-sm leading-relaxed text-stone-500">
        Tell people about your organization.
      </p>

      <div className="mt-5 space-y-6">
        {/* ── Company identity ──────────────────────────────────── */}
        <div className={groupCls}>
          <div>
            <p className={groupTitleCls}>Company identity</p>
            <p className={groupDescCls}>
              Name, logo, and what your company does.
            </p>
          </div>
          <CareerCardCompanyIdentitySettings
            form={form}
            setForm={setForm}
            logo={logo}
            logoV={logoV}
            logoBusy={logoBusy}
            logoMsg={logoMsg}
            logoRef={logoRef}
            onLogoSelected={onLogoSelected}
            onRemoveLogo={onRemoveLogo}
          />
        </div>

        {/* ── Company details ───────────────────────────────────── */}
        <div className={groupCls}>
          <div>
            <p className={groupTitleCls}>Company details</p>
            <p className={groupDescCls}>Locations and services you offer.</p>
          </div>
          <ListEditor
            label="Locations"
            addLabel="Add a location"
            items={form.locations}
            onChange={(v) => set("locations", v)}
          />
          <ListEditor
            label="Products / Services"
            addLabel="Add a product or service"
            items={form.services}
            onChange={(v) => set("services", v)}
          />
        </div>

        {/* ── Contact & links ───────────────────────────────────── */}
        <div className={groupCls}>
          <div>
            <p className={groupTitleCls}>Contact &amp; links</p>
            <p className={groupDescCls}>How people can reach your company.</p>
          </div>

          <div className="space-y-5">
            {/* Contact person */}
            <div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="cp-cperson" className={labelCls}>
                    Contact person
                  </label>
                  <p className="mt-0.5 text-xs text-stone-500">
                    The name shown for inquiries.
                  </p>
                  <input
                    id="cp-cperson"
                    value={form.contactPersonName}
                    onChange={(e) => set("contactPersonName", e.target.value)}
                    className={`mt-1.5 ${inputCls}`}
                    placeholder="Jane Doe"
                  />
                </div>
                <div>
                  <label htmlFor="cp-crole" className={labelCls}>
                    Role
                  </label>
                  <p className="mt-0.5 text-xs text-stone-500">
                    Their title at the company.
                  </p>
                  <input
                    id="cp-crole"
                    value={form.contactPersonRole}
                    onChange={(e) => set("contactPersonRole", e.target.value)}
                    className={`mt-1.5 ${inputCls}`}
                    placeholder="Head of Talent"
                  />
                </div>
              </div>
              <div className="mt-2">
                <Toggle
                  checked={form.showContactPerson}
                  onChange={(v) => set("showContactPerson", v)}
                  label="Show contact person publicly"
                />
                {form.contactPersonName.trim() &&
                  (form.showContactPerson ? publicHint : privateHint)}
              </div>
            </div>

            {/* Phone / WhatsApp / Email */}
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="cp-phone" className={labelCls}>
                  Public phone
                </label>
                <p className="mt-0.5 text-xs text-stone-500">
                  A business phone number.
                </p>
                <input
                  id="cp-phone"
                  value={form.publicPhone}
                  onChange={(e) => set("publicPhone", e.target.value)}
                  className={`mt-1.5 ${inputCls}`}
                  placeholder="+1 415 555 0100"
                />
                <div className="mt-2">
                  <Toggle
                    checked={form.showPublicPhone}
                    onChange={(v) => set("showPublicPhone", v)}
                    label="Show publicly"
                  />
                  {form.publicPhone.trim() &&
                    (form.showPublicPhone ? publicHint : privateHint)}
                </div>
              </div>

              <div>
                <label htmlFor="cp-whatsapp" className={labelCls}>
                  WhatsApp
                </label>
                <p className="mt-0.5 text-xs text-stone-500">
                  Let people reach you directly.
                </p>
                <div className="mt-1.5 grid gap-2 sm:grid-cols-[200px_minmax(0,1fr)]">
                  <WhatsappCountrySelect
                    id="cp-whatsapp-country"
                    value={form.whatsappCountry}
                    onChange={(v) => set("whatsappCountry", v)}
                    className={inputCls}
                  />
                  <input
                    id="cp-whatsapp"
                    inputMode="tel"
                    value={form.whatsappNumber}
                    onChange={(e) => set("whatsappNumber", e.target.value)}
                    className={inputCls}
                    placeholder="98765 43210"
                  />
                </div>
                <div className="mt-2">
                  <Toggle
                    checked={form.showWhatsapp}
                    onChange={(v) => set("showWhatsapp", v)}
                    label="Show publicly"
                  />
                  {form.whatsappNumber.trim() &&
                    (form.showWhatsapp ? publicHint : privateHint)}
                  {!form.whatsappNumber.trim() && (
                    <p className="mt-1.5 text-xs text-stone-500">
                      Pick the country, then enter your normal national number.
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="cp-email" className={labelCls}>
                  Public email
                </label>
                <p className="mt-0.5 text-xs text-stone-500">
                  A business email address.
                </p>
                <input
                  id="cp-email"
                  type="email"
                  value={form.publicEmail}
                  onChange={(e) => set("publicEmail", e.target.value)}
                  className={`mt-1.5 ${inputCls}`}
                  placeholder="hello@example.com"
                />
                <div className="mt-2">
                  <Toggle
                    checked={form.showPublicEmail}
                    onChange={(v) => set("showPublicEmail", v)}
                    label="Show publicly"
                  />
                  {form.publicEmail.trim() &&
                    (form.showPublicEmail ? publicHint : privateHint)}
                </div>
              </div>
            </div>

            {/* Social links */}
            <div>
              <p className={labelCls}>Social &amp; web links</p>
              <p className="mt-0.5 text-xs text-stone-500">
                Add links to your online presence.
              </p>
              <div className="mt-3 grid gap-4 sm:grid-cols-2">
                {(
                  [
                    ["websiteUrl", "Website", "https://…"],
                    [
                      "linkedinUrl",
                      "LinkedIn",
                      "https://linkedin.com/company/…",
                    ],
                    ["facebookUrl", "Facebook", "https://facebook.com/…"],
                    ["instagramUrl", "Instagram", "https://instagram.com/…"],
                    ["xUrl", "X", "https://x.com/…"],
                    ["youtubeUrl", "YouTube", "https://youtube.com/…"],
                    ["tiktokUrl", "TikTok", "https://tiktok.com/…"],
                  ] as const
                ).map(([key, label, placeholder]) => (
                  <div key={key}>
                    <label htmlFor={`cp-${key}`} className={labelCls}>
                      {label}
                    </label>
                    <input
                      id={`cp-${key}`}
                      type="url"
                      value={form[key]}
                      onChange={(e) => set(key, e.target.value)}
                      className={`mt-1.5 ${inputCls}`}
                      placeholder={placeholder}
                      autoComplete="off"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Hiring ──────────────────────────────────────────── */}
        <div className={groupCls}>
          <div>
            <p className={groupTitleCls}>Hiring</p>
            <p className={groupDescCls}>
              Share open roles and company information.
            </p>
          </div>
          <Toggle
            checked={form.hiringOpen}
            onChange={(v) => set("hiringOpen", v)}
            label="Hiring / Open roles enabled"
            description="Show a hiring badge and link on your company profile."
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="cp-orsum" className={labelCls}>
                Summary
              </label>
              <p className="mt-0.5 text-xs text-stone-500">
                A short message about current opportunities.
              </p>
              <input
                id="cp-orsum"
                value={form.openRolesSummary}
                onChange={(e) => set("openRolesSummary", e.target.value)}
                className={`mt-1.5 ${inputCls}`}
                placeholder="Explore current opportunities and grow with us."
              />
            </div>
            <div>
              <label htmlFor="cp-orurl" className={labelCls}>
                Open roles URL
              </label>
              <p className="mt-0.5 text-xs text-stone-500">
                Where candidates can view and apply.
              </p>
              <input
                id="cp-orurl"
                type="url"
                value={form.openRolesUrl}
                onChange={(e) => set("openRolesUrl", e.target.value)}
                className={`mt-1.5 ${inputCls}`}
                placeholder="https://…"
              />
            </div>
            <div>
              <label htmlFor="cp-cpsum" className={labelCls}>
                Company profile summary
              </label>
              <p className="mt-0.5 text-xs text-stone-500">
                A short description of your company profile page.
              </p>
              <input
                id="cp-cpsum"
                value={form.companyProfileSummary}
                onChange={(e) => set("companyProfileSummary", e.target.value)}
                className={`mt-1.5 ${inputCls}`}
                placeholder="View company profile, work, case studies and achievements."
              />
            </div>
            <div>
              <label htmlFor="cp-cpurl" className={labelCls}>
                Company profile URL
              </label>
              <p className="mt-0.5 text-xs text-stone-500">
                A link to your company profile or careers page.
              </p>
              <input
                id="cp-cpurl"
                type="url"
                value={form.companyProfileUrl}
                onChange={(e) => set("companyProfileUrl", e.target.value)}
                className={`mt-1.5 ${inputCls}`}
                placeholder="https://…"
              />
            </div>
          </div>
        </div>

        {/* ── Visibility + save ─────────────────────────────────── */}
        <div className={groupCls}>
          <div>
            <p className={groupTitleCls}>Visibility</p>
            <p className={groupDescCls}>
              Control when your company profile appears.
            </p>
          </div>
          <Toggle
            checked={form.isVisible}
            onChange={(v) => set("isVisible", v)}
            label="Show company profile publicly"
            description="The company section only appears on your published Career Card when enabled."
          />
          {hasSavedRow &&
            (form.isVisible ? (
              <p className="text-xs text-emerald-700">
                Company profile can appear on NFC Compact.
              </p>
            ) : (
              <p className="text-xs text-amber-700">
                Company profile saved, but it is currently hidden from your
                public Career Card.
              </p>
            ))}
          <div className="flex items-center gap-3 pt-2">
            <Button
              type="button"
              onClick={save}
              disabled={isPending || !form.companyName.trim()}
              className="bg-emerald-700 hover:bg-emerald-800"
            >
              {isPending ? "Saving…" : "Save company profile"}
            </Button>
            {saved && !dirty && (
              <p role="status" className="text-sm font-medium text-emerald-700">
                Saved
              </p>
            )}
            {dirty && <p className="text-sm text-amber-700">Unsaved changes</p>}
            {error && (
              <p role="alert" className="text-sm text-red-600">
                {error}
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
