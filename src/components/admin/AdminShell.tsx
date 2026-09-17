"use client";

import { useState, type ReactNode } from "react";
import { Menu, X } from "lucide-react";
import { Sidebar } from "@/components/admin/Sidebar";
import { useNewInquiryCount } from "@/hooks/queries/useNewInquiryCount";

export function AdminShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const { data: inquiryNewCount = 0 } = useNewInquiryCount();

  return (
    <div className="min-h-screen bg-surface">
      <div className="sticky top-0 z-40 flex items-center gap-3 border-b border-border bg-card px-4 py-3 lg:hidden">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="rounded-lg p-2 text-primary hover:bg-surface"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-2">
          <span className="block h-2 w-2 rounded-sm bg-accent" aria-hidden />
          <span className="font-heading text-sm font-bold text-primary">
            VEER Admin
          </span>
        </div>
      </div>

      {open ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-primary/40 backdrop-blur-sm lg:hidden"
          aria-label="Close menu overlay"
          onClick={() => setOpen(false)}
        />
      ) : null}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="absolute right-3 top-3 lg:hidden">
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded-lg p-2 text-text-inverse/70 hover:bg-white/10"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <Sidebar
          onNavigate={() => setOpen(false)}
          inquiryNewCount={inquiryNewCount}
        />
      </aside>

      <main className="min-h-screen lg:pl-64">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
}
