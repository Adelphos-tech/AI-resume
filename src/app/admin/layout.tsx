import { AdminShell } from "@/components/admin/admin-shell";
import { requireInternalSession } from "@/server/session";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireInternalSession();

  return (
    <AdminShell
      user={{ email: session.user.email, role: session.user.role ?? "" }}
    >
      {children}
    </AdminShell>
  );
}
