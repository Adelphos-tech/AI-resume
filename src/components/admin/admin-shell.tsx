"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  ADMIN_NAV_PRIMARY,
  ADMIN_NAV_SECONDARY,
  adminNavTitle,
  isAdminNavActive,
  type AdminNavItem,
} from "@/components/admin/admin-nav";
import { SignOutButton } from "@/components/admin/sign-out-button";
import { BrandMark } from "@/components/brand-mark";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";

export interface AdminUser {
  email: string;
  role: string;
}

function NavItems({ items }: { items: readonly AdminNavItem[] }) {
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();

  return (
    <SidebarMenu>
      {items.map((item) => {
        const active = isAdminNavActive(pathname, item.href);
        return (
          <SidebarMenuItem key={item.href}>
            <SidebarMenuButton asChild isActive={active}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                onClick={() => setOpenMobile(false)}
              >
                <item.icon />
                <span>{item.label}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );
}

export function AdminShell({
  user,
  children,
}: {
  user: AdminUser;
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="px-4 py-4">
          <Link href="/admin" aria-label="RoleRace dashboard">
            <BrandMark />
          </Link>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <NavItems items={ADMIN_NAV_PRIMARY} />
            </SidebarGroupContent>
          </SidebarGroup>
          <SidebarSeparator />
          <SidebarGroup>
            <SidebarGroupContent>
              <NavItems items={ADMIN_NAV_SECONDARY} />
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="gap-3 p-4">
          <div className="min-w-0 space-y-1.5">
            <p className="truncate text-sm font-medium">{user.email}</p>
            <Badge variant="secondary" className="font-mono text-xs">
              {user.role}
            </Badge>
          </div>
          <SignOutButton />
        </SidebarFooter>
      </Sidebar>

      <SidebarInset className="min-w-0">
        <header className="flex h-14 shrink-0 items-center gap-3 border-b px-4 md:px-6">
          <SidebarTrigger aria-label="Toggle navigation" />
          <Separator orientation="vertical" className="h-5" />
          <h1 className="text-sm font-medium">{adminNavTitle(pathname)}</h1>
        </header>
        <main className="flex-1 px-4 py-6 md:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-5xl">{children}</div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
