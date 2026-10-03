import {
  FileText,
  Globe,
  HelpCircle,
  LayoutDashboard,
  LayoutTemplate,
  PanelsTopLeft,
  Settings,
  Sparkles,
  UserRound,
  type LucideIcon,
} from "lucide-react";

export interface CandidateNavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export const CANDIDATE_NAV_PRIMARY: readonly CandidateNavItem[] = [
  { href: "/candidate", label: "Dashboard", icon: LayoutDashboard },
  { href: "/candidate/profile", label: "Career Profile", icon: UserRound },
  { href: "/candidate/resumes", label: "Resumes", icon: FileText },
  { href: "/candidate/ai-review", label: "AI Review", icon: Sparkles },
  { href: "/candidate/templates", label: "Templates", icon: LayoutTemplate },
  { href: "/candidate/public-profile", label: "Career Card", icon: Globe },
  {
    href: "/candidate/career-site",
    label: "Career Site",
    icon: PanelsTopLeft,
  },
];

export const CANDIDATE_NAV_SECONDARY: readonly CandidateNavItem[] = [
  { href: "/candidate/settings", label: "Settings", icon: Settings },
  { href: "/candidate/help", label: "Help", icon: HelpCircle },
];

export function isCandidateNavActive(pathname: string, href: string) {
  return href === "/candidate"
    ? pathname === href
    : pathname === href || pathname.startsWith(`${href}/`);
}
