import { useEffect, useState } from "react";

/**
 * Subscribe to a CSS media query and return whether it currently matches.
 *
 * Defaults to `false` on the server / first render to avoid hydration
 * mismatches, then converges to the real value after `useEffect` runs.
 *
 * Used by `HelpCenterModal` to switch between a centered `Dialog` (≥640px)
 * and a bottom-anchored `Drawer` (<640px). The shared `useIsMobile` hook in
 * `components/ui/use-mobile.ts` uses 768px, which does not match the spec;
 * the help center needs its own breakpoint at 640px.
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;

    const mql = window.matchMedia(query);
    const onChange = () => setMatches(mql.matches);

    // Sync once after mount to capture the real value.
    setMatches(mql.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [query]);

  return matches;
}
