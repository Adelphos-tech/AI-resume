"use client";

import { Plus, Trash2 } from "lucide-react";
import { useState, useTransition } from "react";
import {
  useFieldArray,
  useForm,
  type Control,
  type UseFormRegister,
} from "react-hook-form";

import { saveProfileSectionAction } from "@/app/candidate/(workspace)/profile/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type {
  MasterCareerProfileBasics,
  MasterCareerProfileCertificationEntry,
  MasterCareerProfileEducationEntry,
  MasterCareerProfileLanguageEntry,
  MasterCareerProfileProjectEntry,
  MasterCareerProfileSkillGroup,
  MasterCareerProfileWorkEntry,
} from "@/lib/master-career-profile-schema";

/* ---------- shared save plumbing ---------- */

type Feedback = { kind: "success" | "error"; message: string } | null;

function useSectionSave(section: string) {
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<Feedback>(null);

  function save(payload: unknown) {
    setFeedback(null);
    startTransition(async () => {
      try {
        const result = await saveProfileSectionAction(section, payload);
        setFeedback(
          result.success
            ? { kind: "success", message: "Saved." }
            : { kind: "error", message: result.message },
        );
      } catch {
        setFeedback({
          kind: "error",
          message: "Unable to save. Please try again.",
        });
      }
    });
  }

  return { save, isPending, feedback };
}

function SaveRow({
  pending,
  feedback,
}: {
  pending: boolean;
  feedback: Feedback;
}) {
  return (
    <div className="flex items-center gap-4 pt-2">
      <Button
        type="submit"
        disabled={pending}
        className="bg-emerald-700 hover:bg-emerald-800"
      >
        {pending ? "Saving…" : "Save section"}
      </Button>
      {feedback ? (
        <p
          role={feedback.kind === "error" ? "alert" : "status"}
          className={`text-sm ${feedback.kind === "error" ? "text-red-600" : "text-emerald-700"}`}
        >
          {feedback.message}
        </p>
      ) : null}
    </div>
  );
}

function Field({
  label,
  id,
  children,
  hint,
}: {
  label: string;
  id: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {hint ? <p className="text-xs text-stone-400">{hint}</p> : null}
    </div>
  );
}

const SECTION_CLS = "rounded-2xl border border-stone-200 bg-white p-5 md:p-7";
const ENTRY_CLS =
  "space-y-4 rounded-xl border border-stone-100 bg-stone-50/40 p-4";

/* ---------- basics ---------- */

export function BasicsSection({
  basics,
}: {
  basics: MasterCareerProfileBasics;
}) {
  const { save, isPending, feedback } = useSectionSave("basics");
  const { register, handleSubmit, control } = useForm({
    defaultValues: {
      fullName: basics.fullName ?? "",
      headline: basics.headline ?? "",
      email: basics.email ?? "",
      phone: basics.phone ?? "",
      location: basics.location ?? "",
      summary: basics.summary ?? "",
      links: basics.links,
    },
  });
  const linksArray = useFieldArray({
    control,
    name: "links",
    keyName: "_key",
  });

  return (
    <form
      onSubmit={handleSubmit((v) =>
        save({ ...v, links: v.links.filter((l) => l.label && l.url) }),
      )}
      className={SECTION_CLS}
    >
      <h2 className="text-lg font-semibold text-stone-900">Basics</h2>
      <p className="mt-1 text-xs text-stone-500">
        Your name and contact details. This profile email is shown on your
        resume — it does not change your sign-in email.
      </p>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <Field label="Full name" id="fullName">
          <Input id="fullName" autoComplete="name" {...register("fullName")} />
        </Field>
        <Field
          label="Headline"
          id="headline"
          hint="e.g. Senior Product Manager"
        >
          <Input id="headline" {...register("headline")} />
        </Field>
        <Field label="Resume email" id="email">
          <Input id="email" type="email" {...register("email")} />
        </Field>
        <Field label="Phone" id="phone">
          <Input id="phone" autoComplete="tel" {...register("phone")} />
        </Field>
        <Field label="Location" id="location">
          <Input
            id="location"
            autoComplete="address-level2"
            {...register("location")}
          />
        </Field>
      </div>
      <div className="mt-4">
        <Field label="Professional summary" id="summary">
          <Textarea id="summary" rows={4} {...register("summary")} />
        </Field>
      </div>
      <div className="mt-4 space-y-2">
        <Label>Links</Label>
        {linksArray.fields.map((f, i) => (
          <div key={f._key} className="flex gap-2">
            <Input
              placeholder="Label (e.g. LinkedIn)"
              {...register(`links.${i}.label`)}
            />
            <Input
              type="url"
              placeholder="https://…"
              {...register(`links.${i}.url`)}
            />
            <button
              type="button"
              onClick={() => linksArray.remove(i)}
              aria-label="Remove link"
              className="shrink-0 rounded-lg p-2 text-stone-400 hover:bg-red-50 hover:text-red-600"
            >
              <Trash2 className="size-4" />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => linksArray.append({ label: "", url: "" })}
          className="text-xs font-semibold text-emerald-700 hover:text-emerald-800"
        >
          + Add link
        </button>
      </div>
      <SaveRow pending={isPending} feedback={feedback} />
    </form>
  );
}

/* ---------- generic repeatable entry scaffolding ---------- */

function EntryCard({
  title,
  onRemove,
  children,
}: {
  title: string;
  onRemove: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className={ENTRY_CLS}>
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-stone-800">{title}</p>
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${title}`}
          className="rounded-lg p-1.5 text-stone-400 transition-colors hover:bg-red-50 hover:text-red-600"
        >
          <Trash2 className="size-4" />
        </button>
      </div>
      {children}
    </div>
  );
}

function EmptyHint({ text }: { text: string }) {
  return (
    <p className="rounded-xl border border-dashed border-stone-300 px-4 py-5 text-center text-xs text-stone-500">
      {text}
    </p>
  );
}

function HighlightsEditor({
  register,
  control,
  name,
}: {
  register: UseFormRegister<never>;
  control: Control<never>;
  name: string;
}) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: name as never,
    keyName: "_key",
  });
  return (
    <div className="space-y-2">
      <Label>Highlights / achievements</Label>
      {fields.map((f, i) => (
        <div key={f._key} className="flex gap-2">
          <Input {...register(`${name}.${i}.value` as never)} />
          <button
            type="button"
            onClick={() => remove(i)}
            aria-label="Remove highlight"
            className="shrink-0 rounded-lg p-2 text-stone-400 hover:bg-red-50 hover:text-red-600"
          >
            <Trash2 className="size-4" />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => append({ value: "" } as never)}
        className="text-xs font-semibold text-emerald-700 hover:text-emerald-800"
      >
        + Add highlight
      </button>
    </div>
  );
}

/* ---------- work ---------- */

export function WorkSection({
  work,
}: {
  work: MasterCareerProfileWorkEntry[];
}) {
  const { save, isPending, feedback } = useSectionSave("work");
  const { register, handleSubmit, control } = useForm({
    defaultValues: {
      work: work.map((w) => ({
        ...w,
        location: w.location ?? "",
        employmentType: w.employmentType ?? "",
        startDate: w.startDate ?? "",
        endDate: w.endDate ?? "",
        summary: w.summary ?? "",
        highlights: w.highlights.map((value) => ({ value })),
      })),
    },
  });
  const { fields, append, remove } = useFieldArray({
    control,
    name: "work",
    keyName: "_key",
  });

  return (
    <form
      onSubmit={handleSubmit((v) =>
        save(
          v.work.map((w) => ({
            ...w,
            highlights: w.highlights.map((h) => h.value),
          })),
        ),
      )}
      className={`${SECTION_CLS} space-y-4`}
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-stone-900">Experience</h2>
          <p className="mt-1 text-xs text-stone-500">
            Your work history, most recent first.
          </p>
        </div>
        <button
          type="button"
          onClick={() =>
            append({
              id: crypto.randomUUID(),
              company: "",
              position: "",
              location: "",
              employmentType: "",
              startDate: "",
              endDate: "",
              isCurrent: false,
              summary: "",
              highlights: [],
            })
          }
          className="inline-flex items-center gap-1.5 rounded-lg border border-stone-200 px-3 py-2 text-xs font-semibold text-stone-700 hover:border-emerald-600/30 hover:bg-emerald-50/50"
        >
          <Plus className="size-3.5" aria-hidden /> Add experience
        </button>
      </div>

      {fields.length === 0 ? (
        <EmptyHint text="No experience added yet. Add your work history to strengthen your career profile." />
      ) : (
        fields.map((f, i) => (
          <EntryCard
            key={f._key}
            title={f.position || f.company || `Role ${i + 1}`}
            onRemove={() => remove(i)}
          >
            <input type="hidden" {...register(`work.${i}.id`)} />
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Position" id={`work.${i}.position`}>
                <Input
                  id={`work.${i}.position`}
                  {...register(`work.${i}.position`)}
                />
              </Field>
              <Field label="Company" id={`work.${i}.company`}>
                <Input
                  id={`work.${i}.company`}
                  {...register(`work.${i}.company`)}
                />
              </Field>
              <Field label="Location" id={`work.${i}.location`}>
                <Input
                  id={`work.${i}.location`}
                  {...register(`work.${i}.location`)}
                />
              </Field>
              <Field label="Employment type" id={`work.${i}.employmentType`}>
                <Input
                  id={`work.${i}.employmentType`}
                  {...register(`work.${i}.employmentType`)}
                />
              </Field>
              <Field label="Start (YYYY or YYYY-MM)" id={`work.${i}.startDate`}>
                <Input
                  id={`work.${i}.startDate`}
                  placeholder="2023-04"
                  {...register(`work.${i}.startDate`)}
                />
              </Field>
              <Field label="End" id={`work.${i}.endDate`}>
                <Input
                  id={`work.${i}.endDate`}
                  placeholder="YYYY-MM or leave blank"
                  {...register(`work.${i}.endDate`)}
                />
              </Field>
            </div>
            <label className="flex items-center gap-2 text-xs font-medium text-stone-600">
              <input
                type="checkbox"
                className="size-4 rounded accent-emerald-700"
                {...register(`work.${i}.isCurrent`)}
              />
              I currently work here
            </label>
            <Field label="Summary" id={`work.${i}.summary`}>
              <Textarea
                id={`work.${i}.summary`}
                rows={2}
                {...register(`work.${i}.summary`)}
              />
            </Field>
            <HighlightsEditor
              register={register as never}
              control={control as never}
              name={`work.${i}.highlights`}
            />
          </EntryCard>
        ))
      )}
      <SaveRow pending={isPending} feedback={feedback} />
    </form>
  );
}

/* ---------- education ---------- */

export function EducationSection({
  education,
}: {
  education: MasterCareerProfileEducationEntry[];
}) {
  const { save, isPending, feedback } = useSectionSave("education");
  const { register, handleSubmit, control } = useForm({
    defaultValues: {
      education: education.map((e) => ({
        ...e,
        degree: e.degree ?? "",
        fieldOfStudy: e.fieldOfStudy ?? "",
        location: e.location ?? "",
        startDate: e.startDate ?? "",
        endDate: e.endDate ?? "",
        grade: e.grade ?? "",
        highlights: e.highlights.map((value) => ({ value })),
      })),
    },
  });
  const { fields, append, remove } = useFieldArray({
    control,
    name: "education",
    keyName: "_key",
  });

  return (
    <form
      onSubmit={handleSubmit((v) =>
        save(
          v.education.map((e) => ({
            ...e,
            highlights: e.highlights.map((h) => h.value),
          })),
        ),
      )}
      className={`${SECTION_CLS} space-y-4`}
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-stone-900">Education</h2>
          <p className="mt-1 text-xs text-stone-500">
            Degrees and formal training.
          </p>
        </div>
        <button
          type="button"
          onClick={() =>
            append({
              id: crypto.randomUUID(),
              institution: "",
              degree: "",
              fieldOfStudy: "",
              location: "",
              startDate: "",
              endDate: "",
              grade: "",
              highlights: [],
            })
          }
          className="inline-flex items-center gap-1.5 rounded-lg border border-stone-200 px-3 py-2 text-xs font-semibold text-stone-700 hover:border-emerald-600/30 hover:bg-emerald-50/50"
        >
          <Plus className="size-3.5" aria-hidden /> Add education
        </button>
      </div>

      {fields.length === 0 ? (
        <EmptyHint text="No education added yet." />
      ) : (
        fields.map((f, i) => (
          <EntryCard
            key={f._key}
            title={f.degree || f.institution || `Education ${i + 1}`}
            onRemove={() => remove(i)}
          >
            <input type="hidden" {...register(`education.${i}.id`)} />
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Institution" id={`edu.${i}.institution`}>
                <Input
                  id={`edu.${i}.institution`}
                  {...register(`education.${i}.institution`)}
                />
              </Field>
              <Field label="Degree" id={`edu.${i}.degree`}>
                <Input
                  id={`edu.${i}.degree`}
                  {...register(`education.${i}.degree`)}
                />
              </Field>
              <Field label="Field of study" id={`edu.${i}.fieldOfStudy`}>
                <Input
                  id={`edu.${i}.fieldOfStudy`}
                  {...register(`education.${i}.fieldOfStudy`)}
                />
              </Field>
              <Field label="Location" id={`edu.${i}.location`}>
                <Input
                  id={`edu.${i}.location`}
                  {...register(`education.${i}.location`)}
                />
              </Field>
              <Field label="Start" id={`edu.${i}.startDate`}>
                <Input
                  id={`edu.${i}.startDate`}
                  placeholder="YYYY-MM"
                  {...register(`education.${i}.startDate`)}
                />
              </Field>
              <Field label="End" id={`edu.${i}.endDate`}>
                <Input
                  id={`edu.${i}.endDate`}
                  placeholder="YYYY-MM"
                  {...register(`education.${i}.endDate`)}
                />
              </Field>
            </div>
            <HighlightsEditor
              register={register as never}
              control={control as never}
              name={`education.${i}.highlights`}
            />
          </EntryCard>
        ))
      )}
      <SaveRow pending={isPending} feedback={feedback} />
    </form>
  );
}

/* ---------- skills ---------- */

export function SkillsSection({
  skills,
}: {
  skills: MasterCareerProfileSkillGroup[];
}) {
  const { save, isPending, feedback } = useSectionSave("skills");
  const { register, handleSubmit, control } = useForm({
    defaultValues: {
      skills: skills.map((s) => ({
        ...s,
        keywords: s.keywords.map((value) => ({ value })),
      })),
    },
  });
  const { fields, append, remove } = useFieldArray({
    control,
    name: "skills",
    keyName: "_key",
  });

  return (
    <form
      onSubmit={handleSubmit((v) =>
        save(
          v.skills.map((s) => ({
            ...s,
            keywords: s.keywords
              .map((k) => k.value)
              .filter((k) => k.trim().length > 0),
          })),
        ),
      )}
      className={`${SECTION_CLS} space-y-4`}
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-stone-900">Skills</h2>
          <p className="mt-1 text-xs text-stone-500">
            Group your skills — e.g. Product, Analytics, Languages.
          </p>
        </div>
        <button
          type="button"
          onClick={() =>
            append({ id: crypto.randomUUID(), name: "", keywords: [] })
          }
          className="inline-flex items-center gap-1.5 rounded-lg border border-stone-200 px-3 py-2 text-xs font-semibold text-stone-700 hover:border-emerald-600/30 hover:bg-emerald-50/50"
        >
          <Plus className="size-3.5" aria-hidden /> Add skill group
        </button>
      </div>

      {fields.length === 0 ? (
        <EmptyHint text="No skills added yet." />
      ) : (
        fields.map((f, i) => (
          <EntryCard
            key={f._key}
            title={f.name || `Skill group ${i + 1}`}
            onRemove={() => remove(i)}
          >
            <input type="hidden" {...register(`skills.${i}.id`)} />
            <Field label="Group name" id={`skills.${i}.name`}>
              <Input
                id={`skills.${i}.name`}
                placeholder="e.g. Product"
                {...register(`skills.${i}.name`)}
              />
            </Field>
            <SkillKeywords
              register={register as never}
              control={control as never}
              name={`skills.${i}.keywords`}
            />
          </EntryCard>
        ))
      )}
      <SaveRow pending={isPending} feedback={feedback} />
    </form>
  );
}

function SkillKeywords({
  register,
  control,
  name,
}: {
  register: UseFormRegister<never>;
  control: Control<never>;
  name: string;
}) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: name as never,
    keyName: "_key",
  });
  return (
    <div className="space-y-2">
      <Label>Skills</Label>
      {fields.map((f, i) => (
        <div key={f._key} className="flex gap-2">
          <Input {...register(`${name}.${i}.value` as never)} />
          <button
            type="button"
            onClick={() => remove(i)}
            aria-label="Remove skill"
            className="shrink-0 rounded-lg p-2 text-stone-400 hover:bg-red-50 hover:text-red-600"
          >
            <Trash2 className="size-4" />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => append({ value: "" } as never)}
        className="text-xs font-semibold text-emerald-700 hover:text-emerald-800"
      >
        + Add skill
      </button>
    </div>
  );
}

/* ---------- projects ---------- */

export function ProjectsSection({
  projects,
}: {
  projects: MasterCareerProfileProjectEntry[];
}) {
  const { save, isPending, feedback } = useSectionSave("projects");
  const { register, handleSubmit, control } = useForm({
    defaultValues: {
      projects: projects.map((p) => ({
        ...p,
        description: p.description ?? "",
        url: p.url ?? "",
        startDate: p.startDate ?? "",
        endDate: p.endDate ?? "",
        highlights: p.highlights.map((value) => ({ value })),
      })),
    },
  });
  const { fields, append, remove } = useFieldArray({
    control,
    name: "projects",
    keyName: "_key",
  });

  return (
    <form
      onSubmit={handleSubmit((v) =>
        save(
          v.projects.map((p) => ({
            ...p,
            highlights: p.highlights.map((h) => h.value),
          })),
        ),
      )}
      className={`${SECTION_CLS} space-y-4`}
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-stone-900">Projects</h2>
          <p className="mt-1 text-xs text-stone-500">
            Side projects, portfolio work, launches.
          </p>
        </div>
        <button
          type="button"
          onClick={() =>
            append({
              id: crypto.randomUUID(),
              name: "",
              description: "",
              url: "",
              startDate: "",
              endDate: "",
              highlights: [],
            })
          }
          className="inline-flex items-center gap-1.5 rounded-lg border border-stone-200 px-3 py-2 text-xs font-semibold text-stone-700 hover:border-emerald-600/30 hover:bg-emerald-50/50"
        >
          <Plus className="size-3.5" aria-hidden /> Add project
        </button>
      </div>

      {fields.length === 0 ? (
        <EmptyHint text="No projects added yet." />
      ) : (
        fields.map((f, i) => (
          <EntryCard
            key={f._key}
            title={f.name || `Project ${i + 1}`}
            onRemove={() => remove(i)}
          >
            <input type="hidden" {...register(`projects.${i}.id`)} />
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Name" id={`proj.${i}.name`}>
                <Input
                  id={`proj.${i}.name`}
                  {...register(`projects.${i}.name`)}
                />
              </Field>
              <Field label="Link" id={`proj.${i}.url`}>
                <Input
                  id={`proj.${i}.url`}
                  type="url"
                  {...register(`projects.${i}.url`)}
                />
              </Field>
              <Field label="Start" id={`proj.${i}.startDate`}>
                <Input
                  id={`proj.${i}.startDate`}
                  placeholder="YYYY-MM"
                  {...register(`projects.${i}.startDate`)}
                />
              </Field>
              <Field label="End" id={`proj.${i}.endDate`}>
                <Input
                  id={`proj.${i}.endDate`}
                  placeholder="YYYY-MM"
                  {...register(`projects.${i}.endDate`)}
                />
              </Field>
            </div>
            <Field label="Description" id={`proj.${i}.description`}>
              <Textarea
                id={`proj.${i}.description`}
                rows={2}
                {...register(`projects.${i}.description`)}
              />
            </Field>
            <HighlightsEditor
              register={register as never}
              control={control as never}
              name={`projects.${i}.highlights`}
            />
          </EntryCard>
        ))
      )}
      <SaveRow pending={isPending} feedback={feedback} />
    </form>
  );
}

/* ---------- certifications ---------- */

export function CertificationsSection({
  certifications,
}: {
  certifications: MasterCareerProfileCertificationEntry[];
}) {
  const { save, isPending, feedback } = useSectionSave("certifications");
  const { register, handleSubmit, control } = useForm({
    defaultValues: {
      certifications: certifications.map((c) => ({
        ...c,
        issuer: c.issuer ?? "",
        date: c.date ?? "",
        expiryDate: c.expiryDate ?? "",
        credentialId: c.credentialId ?? "",
        url: c.url ?? "",
      })),
    },
  });
  const { fields, append, remove } = useFieldArray({
    control,
    name: "certifications",
    keyName: "_key",
  });

  return (
    <form
      onSubmit={handleSubmit((v) => save(v.certifications))}
      className={`${SECTION_CLS} space-y-4`}
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-stone-900">
            Certifications
          </h2>
          <p className="mt-1 text-xs text-stone-500">
            Licenses and certifications.
          </p>
        </div>
        <button
          type="button"
          onClick={() =>
            append({
              id: crypto.randomUUID(),
              name: "",
              issuer: "",
              date: "",
              expiryDate: "",
              credentialId: "",
              url: "",
            })
          }
          className="inline-flex items-center gap-1.5 rounded-lg border border-stone-200 px-3 py-2 text-xs font-semibold text-stone-700 hover:border-emerald-600/30 hover:bg-emerald-50/50"
        >
          <Plus className="size-3.5" aria-hidden /> Add certification
        </button>
      </div>

      {fields.length === 0 ? (
        <EmptyHint text="No certifications added yet." />
      ) : (
        fields.map((f, i) => (
          <EntryCard
            key={f._key}
            title={f.name || `Certification ${i + 1}`}
            onRemove={() => remove(i)}
          >
            <input type="hidden" {...register(`certifications.${i}.id`)} />
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Name" id={`cert.${i}.name`}>
                <Input
                  id={`cert.${i}.name`}
                  {...register(`certifications.${i}.name`)}
                />
              </Field>
              <Field label="Issuer" id={`cert.${i}.issuer`}>
                <Input
                  id={`cert.${i}.issuer`}
                  {...register(`certifications.${i}.issuer`)}
                />
              </Field>
              <Field label="Issue date" id={`cert.${i}.date`}>
                <Input
                  id={`cert.${i}.date`}
                  placeholder="YYYY-MM"
                  {...register(`certifications.${i}.date`)}
                />
              </Field>
              <Field label="Expiry" id={`cert.${i}.expiryDate`}>
                <Input
                  id={`cert.${i}.expiryDate`}
                  placeholder="YYYY-MM"
                  {...register(`certifications.${i}.expiryDate`)}
                />
              </Field>
              <Field label="Credential ID" id={`cert.${i}.credentialId`}>
                <Input
                  id={`cert.${i}.credentialId`}
                  {...register(`certifications.${i}.credentialId`)}
                />
              </Field>
              <Field label="Link" id={`cert.${i}.url`}>
                <Input
                  id={`cert.${i}.url`}
                  type="url"
                  {...register(`certifications.${i}.url`)}
                />
              </Field>
            </div>
          </EntryCard>
        ))
      )}
      <SaveRow pending={isPending} feedback={feedback} />
    </form>
  );
}

/* ---------- languages ---------- */

export function LanguagesSection({
  languages,
}: {
  languages: MasterCareerProfileLanguageEntry[];
}) {
  const { save, isPending, feedback } = useSectionSave("languages");
  const { register, handleSubmit, control } = useForm({
    defaultValues: {
      languages: languages.map((l) => ({ ...l, fluency: l.fluency ?? "" })),
    },
  });
  const { fields, append, remove } = useFieldArray({
    control,
    name: "languages",
    keyName: "_key",
  });

  return (
    <form
      onSubmit={handleSubmit((v) => save(v.languages))}
      className={`${SECTION_CLS} space-y-4`}
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-stone-900">Languages</h2>
          <p className="mt-1 text-xs text-stone-500">
            Languages and proficiency.
          </p>
        </div>
        <button
          type="button"
          onClick={() =>
            append({ id: crypto.randomUUID(), language: "", fluency: "" })
          }
          className="inline-flex items-center gap-1.5 rounded-lg border border-stone-200 px-3 py-2 text-xs font-semibold text-stone-700 hover:border-emerald-600/30 hover:bg-emerald-50/50"
        >
          <Plus className="size-3.5" aria-hidden /> Add language
        </button>
      </div>

      {fields.length === 0 ? (
        <EmptyHint text="No languages added yet." />
      ) : (
        fields.map((f, i) => (
          <EntryCard
            key={f._key}
            title={f.language || `Language ${i + 1}`}
            onRemove={() => remove(i)}
          >
            <input type="hidden" {...register(`languages.${i}.id`)} />
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Language" id={`lang.${i}.language`}>
                <Input
                  id={`lang.${i}.language`}
                  {...register(`languages.${i}.language`)}
                />
              </Field>
              <Field label="Fluency" id={`lang.${i}.fluency`}>
                <Input
                  id={`lang.${i}.fluency`}
                  placeholder="e.g. Native, B2"
                  {...register(`languages.${i}.fluency`)}
                />
              </Field>
            </div>
          </EntryCard>
        ))
      )}
      <SaveRow pending={isPending} feedback={feedback} />
    </form>
  );
}
