import { PublicProfileSettings } from "@/components/candidate/public-profile/public-profile-settings";
import { env } from "@/server/env";
import { getCandidatePublicProfile } from "@/server/public-profile/public-profile";

export const metadata = { title: "Public Profile — RoleRace" };

export default async function CandidatePublicProfilePage() {
  const { profile } = await getCandidatePublicProfile();
  const link = profile?.links[0] ?? null;

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-stone-900 md:text-4xl">
          Public Profile
        </h1>
        <p className="mt-1.5 text-[15px] leading-relaxed text-stone-600">
          Create a professional page you can share with recruiters, clients, and
          professional contacts.
        </p>
      </div>
      <PublicProfileSettings
        key={profile?.slug ?? "none"}
        slug={profile?.slug ?? null}
        isPublished={profile?.isPublished ?? false}
        shareUrl={link ? `${env.PUBLIC_SHARE_ORIGIN}/n/${link.token}` : null}
        publicUrl={profile ? `/u/${profile.slug}` : null}
      />
    </div>
  );
}
