import { cn } from "@/lib/utils";
import { defaultLogos, type LogoItem } from "../../constants/LogoItem";

// Re-export the type for convenience
export type { LogoItem } from "../../constants/LogoItem";

export interface LogoCloudProps {
  title?: string;
  subtitle?: string;
  /** Array of logo items to display. Uses default tech logos if not provided. */
  logos?: LogoItem[];
  className?: string;
  /** Opacity of edge cells (0-100). Default: 60 */
  edgeOpacity?: number;
}

export function LogoCloud({
  title = "Với thông tin của hơn",
  subtitle = "62 trường đại học",
  logos = defaultLogos,
  className,
  edgeOpacity = 50,
}: LogoCloudProps) {
  const clampedOpacity = Math.max(0, Math.min(100, edgeOpacity));
  
  const cellBase = "w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-xl transition-all duration-300";
  const logoCellStyle = cn(
    cellBase,
    "bg-card dark:bg-[#181818] border border-border/70 dark:border-[rgba(38,38,38,0.7)]",
    "flex items-center justify-center p-3 sm:p-4 md:p-5",
    "hover:bg-accent dark:hover:bg-[#222] hover:border-ring cursor-pointer group"
  );
  const emptyCellStyle = cn(
    cellBase,
    "bg-muted/50 dark:bg-[#141414] border border-border/40 dark:border-[rgba(38,38,38,0.4)]"
  );
  const edgeCellStyle = cn(
    cellBase,
    "bg-muted/30 dark:bg-[#121212] border border-border/20 dark:border-[rgba(38,38,38,0.3)]"
  );
  
  // Icon container with generous padding
  const iconStyle = "w-full h-full transform group-hover:scale-110 transition-transform duration-300 flex items-center justify-center [&>svg]:w-full [&>svg]:h-full [&>img]:w-full [&>img]:h-full [&>img]:object-contain";
  
  return (
    <section className={cn("w-full py-16 md:py-20 lg:py-24 bg-background overflow-hidden", className)}>
      <div className="w-full px-4">
        {/* Title */}
        <div className="text-center mb-10 md:mb-14 lg:mb-16">
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-light text-foreground italic">
            {title}
            <br />
            {subtitle}
          </h2>
        </div>

        {/* Mobile Grid - Simple 3-column layout */}
        <div className="sm:hidden">
          <div className="flex justify-center">
            <div className="grid grid-cols-3 gap-4 max-w-xs mx-auto">
              {logos.slice(0, 6).map((logo, index) => (
                <div key={`mobile-logo-${index}`} className={logoCellStyle} title={logo.name}>
                  <div className={iconStyle}>{logo.icon}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tablet Grid - 4-column layout */}
        <div className="hidden sm:block lg:hidden">
          <div 
            className="flex justify-center"
            style={{
              maskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
              WebkitMaskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
            }}
          >
            <div className="grid grid-cols-4 gap-5 max-w-xl mx-auto">
              {logos.map((logo, index) => (
                <div key={`tablet-logo-${index}`} className={logoCellStyle} title={logo.name}>
                  <div className={iconStyle}>{logo.icon}</div>
                </div>
              ))}
              {/* Fill remaining empty cells to complete rows */}
              {logos.length % 4 !== 0 && 
                Array.from({ length: 4 - (logos.length % 4) }).map((_, i) => (
                  <div key={`tablet-empty-${i}`} className={emptyCellStyle} />
                ))
              }
            </div>
          </div>
        </div>

        {/* Desktop Grid - Wide layout with CSS mask for edge fade */}
        <div className="hidden lg:block">
          <div 
            className="flex justify-center"
            style={{
              maskImage: "linear-gradient(to right, transparent, black 15%, black 85%, transparent)",
              WebkitMaskImage: "linear-gradient(to right, transparent, black 15%, black 85%, transparent)",
            }}
          >
            <div className="grid grid-cols-10 gap-6 max-w-7xl mx-auto">
              {/* Row 1: Edge + 6 logos + Edge */}
              <div className={edgeCellStyle} style={{ opacity: clampedOpacity / 100 }} />
              <div className={emptyCellStyle} />
              {logos.slice(0, 6).map((logo, index) => (
                <div key={`desktop-r1-${index}`} className={logoCellStyle} title={logo.name}>
                  <div className={iconStyle}>{logo.icon}</div>
                </div>
              ))}
              <div className={emptyCellStyle} />
              <div className={edgeCellStyle} style={{ opacity: clampedOpacity / 100 }} />
              
              {/* Row 2: If more logos exist */}
              {logos.length > 6 && (
                <>
                  <div className={edgeCellStyle} style={{ opacity: clampedOpacity / 100 }} />
                  <div className={emptyCellStyle} />
                  {logos.slice(6, 12).map((logo, index) => (
                    <div key={`desktop-r2-${index}`} className={logoCellStyle} title={logo.name}>
                      <div className={iconStyle}>{logo.icon}</div>
                    </div>
                  ))}
                  {/* Fill remaining with empty cells */}
                  {logos.slice(6, 12).length < 6 &&
                    Array.from({ length: 6 - logos.slice(6, 12).length }).map((_, i) => (
                      <div key={`desktop-r2-empty-${i}`} className={emptyCellStyle} />
                    ))
                  }
                  <div className={emptyCellStyle} />
                  <div className={edgeCellStyle} style={{ opacity: clampedOpacity / 100 }} />
                </>
              )}
              
              {/* Row 3: If even more logos exist */}
              {logos.length > 12 && (
                <>
                  <div className={edgeCellStyle} style={{ opacity: clampedOpacity / 100 }} />
                  <div className={emptyCellStyle} />
                  <div className={emptyCellStyle} />
                  {logos.slice(12, 16).map((logo, index) => (
                    <div key={`desktop-r3-${index}`} className={logoCellStyle} title={logo.name}>
                      <div className={iconStyle}>{logo.icon}</div>
                    </div>
                  ))}
                  {/* Fill remaining with empty cells */}
                  {logos.slice(12, 16).length < 4 &&
                    Array.from({ length: 4 - logos.slice(12, 16).length }).map((_, i) => (
                      <div key={`desktop-r3-empty-${i}`} className={emptyCellStyle} />
                    ))
                  }
                  <div className={emptyCellStyle} />
                  <div className={emptyCellStyle} />
                  <div className={edgeCellStyle} style={{ opacity: clampedOpacity / 100 }} />
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default LogoCloud;
