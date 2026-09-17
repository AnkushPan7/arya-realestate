"use client";

import { MessageCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { whatsappHref } from "@/lib/site";

export function WhatsAppButton() {
  const [visible, setVisible] = useState(false);
  const href = whatsappHref();

  useEffect(() => {
    const timer = window.setTimeout(() => setVisible(true), 2000);
    return () => window.clearTimeout(timer);
  }, []);

  if (!href) return null;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className={`fixed bottom-6 right-6 z-50 transition-opacity duration-500 ${
        visible ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
    >
      <span className="relative flex h-14 w-14 items-center justify-center">
        <span className="wa-pulse absolute inset-0 rounded-full bg-whatsapp" aria-hidden />
        <span className="relative flex h-14 w-14 items-center justify-center rounded-full bg-whatsapp text-white shadow-elevated transition-transform duration-300 hover:scale-110">
          <MessageCircle className="h-7 w-7 fill-white" strokeWidth={1.5} />
        </span>
      </span>

      <style>{`
        .wa-pulse {
          animation: wa-ring 2s ease-out infinite;
        }

        @keyframes wa-ring {
          0% {
            transform: scale(1);
            opacity: 0.6;
          }
          100% {
            transform: scale(1.5);
            opacity: 0;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .wa-pulse {
            animation: none !important;
          }
        }
      `}</style>
    </a>
  );
}
