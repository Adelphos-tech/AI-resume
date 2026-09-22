import {
  FileText,
  LayoutDashboard,
  PanelsTopLeft,
  Send,
  Settings,
  Users,
  type LucideIcon,
} from "lucide-react";

export interface AdminNavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export const ADMIN_NAV_PRIMARY: readonly AdminNavItem[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/candidates", label: "Candidates", icon: Users },
  { href: "/admin/resumes", label: "Resumes", icon: FileText },
  { href: "/admin/templates", label: "Templates", icon: PanelsTopLeft },
  { href: "/admin/deliveries", label: "Deliveries", icon: Send },
];

export const ADMIN_NAV_SECONDARY: readonly AdminNavItem[] = [
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export const ADMIN_NAV_ALL: readonly AdminNavItem[] = [
  ...ADMIN_NAV_PRIMARY,
  ...ADMIN_NAV_SECONDARY,
];

export function isAdminNavActive(pathname: string, href: string) {
  if (href === "/admin") {
    return pathname === "/admin";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function adminNavTitle(pathname: string) {
  const match = [...ADMIN_NAV_ALL]
    .sort((a, b) => b.href.length - a.href.length)
    .find((item) => isAdminNavActive(pathname, item.href));
  return match?.label ?? "Admin";
}
