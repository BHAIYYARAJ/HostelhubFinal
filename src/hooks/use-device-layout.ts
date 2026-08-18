import { useEffect, useState } from "react";

export type DeviceLayout = "unknown" | "mobile" | "desktop";

const MOBILE_QUERY = "(max-width: 767px)";

/**
 * Three-state viewport hook. "unknown" is the SSR/first-paint value so the
 * mobile app shell never renders desktop chrome on a phone.
 */
export function useDeviceLayout(): DeviceLayout {
  const [layout, setLayout] = useState<DeviceLayout>("unknown");

  useEffect(() => {
    const mql = window.matchMedia(MOBILE_QUERY);
    const apply = () => setLayout(mql.matches ? "mobile" : "desktop");
    apply();
    mql.addEventListener("change", apply);
    return () => mql.removeEventListener("change", apply);
  }, []);

  return layout;
}
