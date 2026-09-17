"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BookOpen,
  Building2,
  ExternalLink,
  FileText,
  Image as ImageIcon,
  LayoutDashboard,
  LogOut,
  MapPin,
  MessageSquare,
  Settings,
  Users,
} from "lucide-react";

const NAV = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/projects", label: "Projects", icon: Building2 },
  { href: "/admin/blog", label: "Blog", icon: FileText },
  { href: "/admin/offices", label: "Offices", icon: MapPin },
  { href: "/admin/hero-slides", label: "Hero Slides", icon: ImageIcon },
  { href: "/admin/site-settings", label: "Site Settings", icon: Settings },
  { href: "/admin/inquiries", label: "Inquiries", icon: MessageSquare },
  { href: "/admin/pages", label: "Pages", icon: BookOpen },
  { href: "/admin/team", label: "Team", icon: Users },
] as const;

type SidebarProps = {
  onNavigate?: () => void;
  inquiryNewCount?: number;
};

export function Sidebar({ onNavigate, inquiryNewCount = 0 }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      router.push("/login");
      router.refresh();
    }
  }

  return (
    <div className="flex h-screen w-64 flex-col bg-primary">
      <div className="mb-4 flex items-center border-b border-white/10 px-4 py-5">
        <Link href="/admin/dashboard">
          <Image
            src="/arya-logo-white.png"
            alt="Arya Real Estate"
            width={140}
            height={50}
            className="h-12 w-auto object-contain"
            unoptimized
          />
        </Link>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {NAV.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          const showBadge =
            item.href === "/admin/inquiries" && inquiryNewCount > 0;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={`flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm transition-colors ${
                active
                  ? "bg-white/10 text-text-inverse"
                  : "text-text-inverse/60 hover:bg-white/10 hover:text-text-inverse"
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="flex-1">{item.label}</span>
              {showBadge ? (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent text-xs font-semibold text-white">
                  {inquiryNewCount > 9 ? "9+" : inquiryNewCount}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 px-3 py-4">
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm text-text-inverse/60 transition-colors hover:bg-white/10 hover:text-text-inverse"
        >
          <ExternalLink className="h-4 w-4" />
          View Website
        </a>
        <button
          type="button"
          onClick={handleLogout}
          className="mt-1 flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-sm text-text-inverse/60 transition-colors hover:bg-white/10 hover:text-text-inverse"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </div>
  );
}
