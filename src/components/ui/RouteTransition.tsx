"use client";

import {
  type ReactNode,
  useSyncExternalStore,
  ViewTransition,
} from "react";

/**
 * Smooth public-route transitions via Next.js 16 + React View Transitions.
 * App Router navigations activate `<ViewTransition>` automatically when
 * `experimental.viewTransition` is enabled. Unsupported browsers get a
 * plain render — no errors.
 */
function subscribe() {
  return () => {};
}

function getSnapshot() {
  return (
    typeof document !== "undefined" &&
    typeof document.startViewTransition === "function"
  );
}

function getServerSnapshot() {
  return false;
}

export function RouteTransition({ children }: { children: ReactNode }) {
  const supportsViewTransitions = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  if (!supportsViewTransitions) {
    return <div className="route-transition">{children}</div>;
  }

  return (
    <ViewTransition>
      <div className="route-transition">{children}</div>
    </ViewTransition>
  );
}
