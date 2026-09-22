import { requireInternalSession } from "@/server/session";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireInternalSession();
  return <>{children}</>;
}
