import type { ReactNode } from "react";

/**
 * Represents a single logo item in the LogoCloud grid
 */
export interface LogoItem {
  /** Display name of the logo (used for accessibility and tooltips) */
  name: string;
  /** React node containing the icon (typically an SVG or Image component) */
  icon: ReactNode;
}

/**
 * University logos for the LogoCloud component.
 * Images are loaded from /public/universities-logo/
 */
export const defaultLogos: LogoItem[] = [
  {
    name: "HCMUS",
    icon: <img src="/universities-logo/hcmus.svg" alt="HCMUS" className="w-full h-full object-contain" />,
  },
  {
    name: "HCMUT",
    icon: <img src="/universities-logo/hcmut.svg" alt="HCMUT" className="w-full h-full object-contain" />,
  },
  {
    name: "IU",
    icon: <img src="/universities-logo/iu.png" alt="IU" className="w-full h-full object-contain" />,
  },
  {
    name: "UEL",
    icon: <img src="/universities-logo/uel.jpg" alt="UEL" className="w-full h-full object-contain" />,
  },
  {
    name: "UHS",
    icon: <img src="/universities-logo/uhs.svg" alt="UHS" className="w-full h-full object-contain" />,
  },
  {
    name: "USSH",
    icon: <img src="/universities-logo/ussh.png" alt="USSH" className="w-full h-full object-contain" />,
  },
];
