"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";

const PROJECT_LINKS = [
  { href: "/projects", label: "All Projects" },
  { href: "/projects/east", label: "East Ahmedabad" },
  { href: "/projects/west", label: "West Ahmedabad" },
] as const;

const MOBILE_LINKS = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/projects", label: "All Projects" },
  { href: "/projects/east", label: "East Ahmedabad" },
  { href: "/projects/west", label: "West Ahmedabad" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contact" },
] as const;

function Logo({
  scrolled = false,
  compact = false,
}: {
  scrolled?: boolean;
  compact?: boolean;
}) {
  const sizeClass = compact || scrolled ? "h-9" : "h-11";

  return (
    <Link href="/">
      <Image
        src="/arya-logo.png"
        alt="Arya Real Estate"
        height={44}
        width={120}
        priority
        className={`${sizeClass} w-auto object-contain transition-all duration-300`}
      />
    </Link>
  );
}

function navLinkClass(active: boolean) {
  return [
    "relative pb-1 text-sm font-medium transition-colors",
    active
      ? "text-primary after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-accent"
      : "text-text-muted hover:text-primary",
  ].join(" ");
}

function isActivePath(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [projectsOpen, setProjectsOpen] = useState(false);
  const projectsActive = isActivePath(pathname, "/projects");

  const [prevPathname, setPrevPathname] = useState(pathname);
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setMobileOpen(false);
    setProjectsOpen(false);
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileOpen]);

  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-card/85 backdrop-blur-lg">
      <div
        className={`mx-auto flex max-w-7xl items-center justify-between px-4 transition-[padding] duration-300 sm:px-6 lg:px-8 ${
          scrolled ? "py-3" : "py-4"
        }`}
      >
        <Logo scrolled={scrolled} />

        <nav className="hidden items-center gap-8 lg:flex" aria-label="Primary">
          <Link href="/" className={navLinkClass(isActivePath(pathname, "/"))}>
            Home
          </Link>
          <Link
            href="/about"
            className={navLinkClass(isActivePath(pathname, "/about"))}
          >
            About
          </Link>

          <div
            className="relative"
            onMouseEnter={() => setProjectsOpen(true)}
            onMouseLeave={() => setProjectsOpen(false)}
          >
            <Link
              href="/projects"
              className={`inline-flex items-center gap-1 ${navLinkClass(projectsActive)}`}
              aria-expanded={projectsOpen}
              aria-haspopup="true"
            >
              Projects
              <ChevronDown
                className={`h-3.5 w-3.5 transition-transform ${
                  projectsOpen ? "rotate-180" : ""
                }`}
              />
            </Link>

            <div
              className={`absolute left-1/2 top-full z-50 w-56 -translate-x-1/2 pt-3 transition-all duration-200 ${
                projectsOpen
                  ? "pointer-events-auto translate-y-0 opacity-100"
                  : "pointer-events-none -translate-y-1 opacity-0"
              }`}
            >
              <div className="rounded-xl bg-card p-2 shadow-elevated">
                {PROJECT_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`block rounded-lg px-4 py-2.5 text-sm font-medium transition-colors hover:bg-surface ${
                      pathname === link.href
                        ? "text-primary"
                        : "text-text-muted hover:text-primary"
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <Link
            href="/blog"
            className={navLinkClass(isActivePath(pathname, "/blog"))}
          >
            Blog
          </Link>
          <Link
            href="/contact"
            className={navLinkClass(isActivePath(pathname, "/contact"))}
          >
            Contact
          </Link>
        </nav>

        <div className="hidden lg:block">
          <Link
            href="/contact"
            className="rounded-xl bg-accent px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-light"
          >
            Contact Us
          </Link>
        </div>

        <button
          type="button"
          className="inline-flex items-center justify-center rounded-lg p-2 text-primary transition-colors hover:bg-surface lg:hidden"
          aria-label="Open menu"
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen(true)}
        >
          <Menu className="h-6 w-6" />
        </button>
      </div>

      <div
        className={`fixed inset-0 z-[60] lg:hidden ${
          mobileOpen ? "pointer-events-auto" : "pointer-events-none"
        }`}
      >
        <button
          type="button"
          aria-label="Close menu"
          className={`absolute inset-0 bg-primary/30 backdrop-blur-sm transition-opacity duration-300 ${
            mobileOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setMobileOpen(false)}
        />

        <aside
          className={`absolute inset-y-0 right-0 flex w-80 max-w-[85vw] flex-col bg-card shadow-elevated transition-transform duration-300 ease-out ${
            mobileOpen ? "translate-x-0" : "translate-x-full"
          }`}
          aria-hidden={!mobileOpen}
        >
          <div className="flex items-center justify-between border-b border-border px-4 py-4">
            <Logo compact />
            <button
              type="button"
              className="rounded-lg p-2 text-primary transition-colors hover:bg-surface"
              aria-label="Close menu"
              onClick={() => setMobileOpen(false)}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className="flex flex-1 flex-col overflow-y-auto px-4" aria-label="Mobile">
            {MOBILE_LINKS.map((link) => (
              <Link
                key={`${link.href}-${link.label}`}
                href={link.href}
                className={`border-b border-border py-3 text-sm font-medium transition-colors ${
                  pathname === link.href
                    ? "text-primary"
                    : "text-text-muted hover:text-primary"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="border-t border-border p-4">
            <Link
              href="/contact"
              className="flex w-full items-center justify-center rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-accent-light"
            >
              Contact Us
            </Link>
          </div>
        </aside>
      </div>
    </header>
  );
}
