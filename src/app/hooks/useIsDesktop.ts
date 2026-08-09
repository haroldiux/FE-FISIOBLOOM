import { useEffect, useState } from "react";

const DESKTOP_QUERY = "(min-width: 768px)"; // Tailwind's `md` breakpoint

/**
 * Tracks whether the viewport is at/above Tailwind's `md` breakpoint.
 *
 * Used to pick which Sidebar DOM to render (desktop capsule vs. mobile
 * bottom bar + drawer) at the JS level instead of just hiding one with
 * CSS. Hiding-only would leave BOTH copies of every `#tour-sidebar-*`
 * nav button mounted at once with the same id — `document.querySelector`
 * would grab whichever comes first in DOM order, which on a phone is the
 * `display:none` desktop copy, handing the tour system a zero-size,
 * invisible target instead of the real visible one.
 */
export function useIsDesktop(): boolean {
  const [isDesktop, setIsDesktop] = useState(
    () => typeof window !== "undefined" && window.matchMedia(DESKTOP_QUERY).matches
  );

  useEffect(() => {
    const mql = window.matchMedia(DESKTOP_QUERY);
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mql.addEventListener("change", handler);
    setIsDesktop(mql.matches);
    return () => mql.removeEventListener("change", handler);
  }, []);

  return isDesktop;
}
