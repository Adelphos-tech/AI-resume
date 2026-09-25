"use client";

import { useState } from "react";
import { FileText } from "lucide-react";

import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { ResumeImportDraft } from "@/server/resume-import/parse-resume";

type Draft = ResumeImportDraft;

function Field({
  id,
  label,
  value,
  onChange,
  placeholder,
}: {
  id: string;
  label: string;
  value: string | null;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="min-w-0 flex-1 space-y-1">
      <Label htmlFor={id} className="text-xs text-stone-500">
        {label}
      </Label>
      <Input
        id={id}
        value={value ?? ""}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="h-8 text-sm"
      />
    </div>
  );
}

function ItemCard({
  id,
  title,
  included,
  onToggle,
  children,
}: {
  id: string;
  title: string;
  included: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <li
      className={`rounded-xl border p-4 transition-opacity ${
        included
          ? "border-stone-200 bg-white"
          : "border-stone-200 bg-stone-50 opacity-60"
      }`}
    >
      <div className="flex items-start gap-3">
        <Checkbox
          id={id}
          checked={included}
          onCheckedChange={onToggle}
          className="mt-0.5"
        />
        <div className="min-w-0 flex-1 space-y-3">
          <Label
            htmlFor={id}
            className="cursor-pointer text-sm font-semibold text-stone-900"
          >
            {title}
          </Label>
          {children}
        </div>
      </div>
    </li>
  );
}

function formatDate(v: string | null, isCurrent?: boolean): string {
  if (isCurrent && !v) return "Present";
  if (!v) return "";
  const [y, m] = v.split("-");
  return m ? `${y}-${m}` : y;
}

export function ImportReview({
  draft,
  rawText,
  fileName,
  fileType,
}: {
  draft: Draft;
  rawText: string;
  fileName: string;
  fileType: string;
}) {
  const [d, setD] = useState<Draft>(() => structuredClone(draft));
  const [excluded, setExcluded] = useState<Set<string>>(new Set());

  const toggle = (key: string) =>
    setExcluded((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  const setBasic = (k: keyof Draft["basics"], v: string) =>
    setD((p) => ({ ...p, basics: { ...p.basics, [k]: v } }));

  const updateWork = (i: number, patch: Partial<Draft["work"][number]>) =>
    setD((p) => ({
      ...p,
      work: p.work.map((w, j) => (j === i ? { ...w, ...patch } : w)),
    }));
  const updateEdu = (i: number, patch: Partial<Draft["education"][number]>) =>
    setD((p) => ({
      ...p,
      education: p.education.map((w, j) => (j === i ? { ...w, ...patch } : w)),
    }));
  const updateSkill = (i: number, patch: Partial<Draft["skills"][number]>) =>
    setD((p) => ({
      ...p,
      skills: p.skills.map((w, j) => (j === i ? { ...w, ...patch } : w)),
    }));
  const updateProj = (i: number, patch: Partial<Draft["projects"][number]>) =>
    setD((p) => ({
      ...p,
      projects: p.projects.map((w, j) => (j === i ? { ...w, ...patch } : w)),
    }));
  const updateCert = (
    i: number,
    patch: Partial<Draft["certifications"][number]>,
  ) =>
    setD((p) => ({
      ...p,
      certifications: p.certifications.map((w, j) =>
        j === i ? { ...w, ...patch } : w,
      ),
    }));
  const updateLang = (i: number, patch: Partial<Draft["languages"][number]>) =>
    setD((p) => ({
      ...p,
      languages: p.languages.map((w, j) => (j === i ? { ...w, ...patch } : w)),
    }));

  const hasBasics =
    d.basics.fullName ||
    d.basics.email ||
    d.basics.phone ||
    d.basics.location ||
    d.basics.links.length > 0 ||
    d.basics.headline;

  return (
    <div className="max-w-3xl space-y-5">
      <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        Nothing will be added to your Career Profile until you confirm.
      </p>

      {hasBasics && (
        <section className="rounded-2xl border border-stone-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-stone-900">
            Basic information
          </h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Field
              id="b-name"
              label="Full name"
              value={d.basics.fullName}
              onChange={(v) => setBasic("fullName", v)}
            />
            <Field
              id="b-headline"
              label="Headline"
              value={d.basics.headline}
              onChange={(v) => setBasic("headline", v)}
            />
            <Field
              id="b-email"
              label="Email"
              value={d.basics.email}
              onChange={(v) => setBasic("email", v)}
            />
            <Field
              id="b-phone"
              label="Phone"
              value={d.basics.phone}
              onChange={(v) => setBasic("phone", v)}
            />
            <Field
              id="b-location"
              label="Location"
              value={d.basics.location}
              onChange={(v) => setBasic("location", v)}
            />
          </div>
          {d.basics.links.length > 0 && (
            <ul className="mt-4 flex flex-wrap gap-2">
              {d.basics.links.map((l) => (
                <li
                  key={l.url}
                  className="rounded-full bg-stone-100 px-3 py-1 text-xs text-stone-600"
                >
                  {l.label}: {l.url}
                </li>
              ))}
            </ul>
          )}
          {d.basics.summary && (
            <div className="mt-4 space-y-1">
              <Label htmlFor="b-summary" className="text-xs text-stone-500">
                Summary
              </Label>
              <Textarea
                id="b-summary"
                value={d.basics.summary}
                onChange={(e) => setBasic("summary", e.target.value)}
                rows={3}
                className="text-sm"
              />
            </div>
          )}
        </section>
      )}

      {d.work.length > 0 && (
        <section className="rounded-2xl border border-stone-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-stone-900">Experience</h2>
          <ul className="mt-4 space-y-3">
            {d.work.map((w, i) => (
              <ItemCard
                key={w.key}
                id={`inc-${w.key}`}
                title={w.position ?? w.company ?? `Experience item ${i + 1}`}
                included={!excluded.has(w.key)}
                onToggle={() => toggle(w.key)}
              >
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field
                    id={`${w.key}-pos`}
                    label="Job title"
                    value={w.position}
                    onChange={(v) => updateWork(i, { position: v })}
                  />
                  <Field
                    id={`${w.key}-co`}
                    label="Company"
                    value={w.company}
                    onChange={(v) => updateWork(i, { company: v })}
                  />
                  <Field
                    id={`${w.key}-st`}
                    label="Start"
                    value={w.startDate}
                    onChange={(v) => updateWork(i, { startDate: v })}
                    placeholder="YYYY or YYYY-MM"
                  />
                  <Field
                    id={`${w.key}-en`}
                    label="End"
                    value={w.isCurrent ? "Present" : w.endDate}
                    onChange={(v) => updateWork(i, { endDate: v })}
                    placeholder={w.isCurrent ? "Present" : "YYYY or YYYY-MM"}
                  />
                </div>
                <div className="min-w-0 space-y-1">
                  <Label
                    htmlFor={`${w.key}-hl`}
                    className="text-xs text-stone-500"
                  >
                    Description (one bullet per line)
                  </Label>
                  <Textarea
                    id={`${w.key}-hl`}
                    value={w.highlights.join("\n")}
                    onChange={(e) =>
                      updateWork(i, {
                        highlights: e.target.value
                          .split("\n")
                          .filter((x) => x.trim().length > 0),
                      })
                    }
                    rows={Math.max(2, w.highlights.length)}
                    className="text-sm"
                  />
                </div>
              </ItemCard>
            ))}
          </ul>
        </section>
      )}

      {d.education.length > 0 && (
        <section className="rounded-2xl border border-stone-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-stone-900">Education</h2>
          <ul className="mt-4 space-y-3">
            {d.education.map((e, i) => (
              <ItemCard
                key={e.key}
                id={`inc-${e.key}`}
                title={e.degree ?? e.institution ?? `Education item ${i + 1}`}
                included={!excluded.has(e.key)}
                onToggle={() => toggle(e.key)}
              >
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field
                    id={`${e.key}-deg`}
                    label="Degree"
                    value={e.degree}
                    onChange={(v) => updateEdu(i, { degree: v })}
                  />
                  <Field
                    id={`${e.key}-ins`}
                    label="Institution"
                    value={e.institution}
                    onChange={(v) => updateEdu(i, { institution: v })}
                  />
                  <Field
                    id={`${e.key}-st`}
                    label="Start"
                    value={e.startDate}
                    onChange={(v) => updateEdu(i, { startDate: v })}
                    placeholder="YYYY or YYYY-MM"
                  />
                  <Field
                    id={`${e.key}-en`}
                    label="End"
                    value={e.endDate}
                    onChange={(v) => updateEdu(i, { endDate: v })}
                    placeholder="YYYY or YYYY-MM"
                  />
                </div>
              </ItemCard>
            ))}
          </ul>
        </section>
      )}

      {d.skills.length > 0 && (
        <section className="rounded-2xl border border-stone-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-stone-900">Skills</h2>
          <ul className="mt-4 space-y-3">
            {d.skills.map((g, i) => (
              <ItemCard
                key={g.key}
                id={`inc-${g.key}`}
                title={g.name}
                included={!excluded.has(g.key)}
                onToggle={() => toggle(g.key)}
              >
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field
                    id={`${g.key}-n`}
                    label="Group name"
                    value={g.name}
                    onChange={(v) => updateSkill(i, { name: v })}
                  />
                  <div className="min-w-0 flex-1 space-y-1 sm:col-span-1">
                    <Label
                      htmlFor={`${g.key}-k`}
                      className="text-xs text-stone-500"
                    >
                      Keywords (comma-separated)
                    </Label>
                    <Textarea
                      id={`${g.key}-k`}
                      value={g.keywords.join(", ")}
                      onChange={(e) =>
                        updateSkill(i, {
                          keywords: e.target.value
                            .split(",")
                            .map((x) => x.trim())
                            .filter(Boolean),
                        })
                      }
                      rows={2}
                      className="text-sm"
                    />
                  </div>
                </div>
              </ItemCard>
            ))}
          </ul>
        </section>
      )}

      {d.projects.length > 0 && (
        <section className="rounded-2xl border border-stone-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-stone-900">Projects</h2>
          <ul className="mt-4 space-y-3">
            {d.projects.map((pr, i) => (
              <ItemCard
                key={pr.key}
                id={`inc-${pr.key}`}
                title={pr.name ?? `Project ${i + 1}`}
                included={!excluded.has(pr.key)}
                onToggle={() => toggle(pr.key)}
              >
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field
                    id={`${pr.key}-n`}
                    label="Project name"
                    value={pr.name}
                    onChange={(v) => updateProj(i, { name: v })}
                  />
                  <Field
                    id={`${pr.key}-u`}
                    label="URL"
                    value={pr.url}
                    onChange={(v) => updateProj(i, { url: v })}
                  />
                </div>
                <div className="min-w-0 space-y-1">
                  <Label
                    htmlFor={`${pr.key}-hl`}
                    className="text-xs text-stone-500"
                  >
                    Description (one bullet per line)
                  </Label>
                  <Textarea
                    id={`${pr.key}-hl`}
                    value={pr.highlights.join("\n")}
                    onChange={(e) =>
                      updateProj(i, {
                        highlights: e.target.value
                          .split("\n")
                          .filter((x) => x.trim().length > 0),
                      })
                    }
                    rows={Math.max(2, pr.highlights.length)}
                    className="text-sm"
                  />
                </div>
              </ItemCard>
            ))}
          </ul>
        </section>
      )}

      {d.certifications.length > 0 && (
        <section className="rounded-2xl border border-stone-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-stone-900">
            Certifications
          </h2>
          <ul className="mt-4 space-y-3">
            {d.certifications.map((c, i) => (
              <ItemCard
                key={c.key}
                id={`inc-${c.key}`}
                title={c.name ?? `Certification ${i + 1}`}
                included={!excluded.has(c.key)}
                onToggle={() => toggle(c.key)}
              >
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field
                    id={`${c.key}-n`}
                    label="Name"
                    value={c.name}
                    onChange={(v) => updateCert(i, { name: v })}
                  />
                  <Field
                    id={`${c.key}-i`}
                    label="Issuer"
                    value={c.issuer}
                    onChange={(v) => updateCert(i, { issuer: v })}
                  />
                  <Field
                    id={`${c.key}-d`}
                    label="Date"
                    value={c.date}
                    onChange={(v) => updateCert(i, { date: v })}
                    placeholder="YYYY or YYYY-MM"
                  />
                </div>
              </ItemCard>
            ))}
          </ul>
        </section>
      )}

      {d.languages.length > 0 && (
        <section className="rounded-2xl border border-stone-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-stone-900">Languages</h2>
          <ul className="mt-4 space-y-3">
            {d.languages.map((l, i) => (
              <ItemCard
                key={l.key}
                id={`inc-${l.key}`}
                title={l.language ?? `Language ${i + 1}`}
                included={!excluded.has(l.key)}
                onToggle={() => toggle(l.key)}
              >
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field
                    id={`${l.key}-n`}
                    label="Language"
                    value={l.language}
                    onChange={(v) => updateLang(i, { language: v })}
                  />
                  <Field
                    id={`${l.key}-f`}
                    label="Proficiency"
                    value={l.fluency}
                    onChange={(v) => updateLang(i, { fluency: v })}
                  />
                </div>
              </ItemCard>
            ))}
          </ul>
        </section>
      )}

      {d.needsReview.length > 0 && (
        <section className="rounded-2xl border border-stone-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-stone-900">Needs review</h2>
          <p className="mt-1 text-xs text-stone-500">
            These parts couldn&apos;t be organized automatically — the original
            text is kept so nothing is lost.
          </p>
          <ul className="mt-4 space-y-3">
            {d.needsReview.map((n) => (
              <li
                key={n.key}
                className="rounded-xl border border-dashed border-stone-300 bg-stone-50 px-4 py-3 text-sm whitespace-pre-wrap text-stone-600"
              >
                {n.text}
              </li>
            ))}
          </ul>
        </section>
      )}

      <details className="rounded-2xl border border-stone-200 bg-white p-5">
        <summary className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-stone-900">
          <FileText className="size-4 text-stone-500" aria-hidden />
          View extracted text ({fileType} · {fileName})
        </summary>
        <div className="mt-4 max-h-96 overflow-y-auto rounded-xl bg-stone-50 p-4 text-sm whitespace-pre-wrap text-stone-700">
          {rawText}
        </div>
      </details>

      <div className="rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-600">
        Your Career Profile has not been changed. Import will be available after
        this review is confirmed.
      </div>
    </div>
  );
}
