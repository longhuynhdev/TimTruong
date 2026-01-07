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
  /** Size of each logo grid cell: 'lg'*/
  gridSize?: "lg";
  /** Opacity of edge cells (0-100). Default: 60 */
  edgeOpacity?: number;
}

// Grid size configurations - responsive sizing
const gridSizeClasses = {
  lg: {
    cell: "w-14 h-14 sm:w-14 sm:h-14 md:w-16 md:h-16 lg:w-16 lg:h-16",
    icon: "w-7 h-7 sm:w-7 sm:h-7 md:w-8 md:h-8",
    gap: "gap-2.5 sm:gap-3 md:gap-3.5",
  }
};

// Desktop grid pattern: 14 columns with edge cells for blur effect
const desktopGridPattern = [
  // Row 1: edge cells + 8 logo cells + edge cells
  { type: "edge" }, { type: "edge" }, { type: "empty" },
  { type: "logo", index: 0 },
  { type: "logo", index: 1 },
  { type: "logo", index: 2 },
  { type: "logo", index: 3 },
  { type: "logo", index: 4 },
  { type: "logo", index: 5 },
  { type: "logo", index: 6 },
  { type: "logo", index: 7 },
  { type: "empty" }, { type: "edge" }, { type: "edge" },
  
  // Row 2: edge cells + 8 logo cells + edge cells
  { type: "edge" }, { type: "edge" }, { type: "empty" },
  { type: "logo", index: 8 },
  { type: "logo", index: 9 },
  { type: "logo", index: 10 },
  { type: "logo", index: 11 },
  { type: "logo", index: 12 },
  { type: "logo", index: 13 },
  { type: "logo", index: 14 },
  { type: "logo", index: 15 },
  { type: "empty" }, { type: "edge" }, { type: "edge" },
  
  // Row 3: all edge/empty except 2 centered logos
  { type: "edge" }, { type: "edge" }, { type: "empty" },
  { type: "empty" }, { type: "empty" }, { type: "empty" },
  { type: "logo", index: 16 },
  { type: "logo", index: 17 },
  { type: "empty" }, { type: "empty" }, { type: "empty" },
  { type: "empty" }, { type: "edge" }, { type: "edge" },
];

export function LogoCloud({
  title = "Với thông tin của hơn",
  subtitle = "62 trường đại học",
  logos = defaultLogos,
  className,
  gridSize = "lg",
  edgeOpacity = 60,
}: LogoCloudProps) {
  const sizeConfig = gridSizeClasses[gridSize];
  // Clamp edgeOpacity between 0 and 100
  const clampedOpacity = Math.max(0, Math.min(100, edgeOpacity));
  
  return (
    <section className={cn("w-full py-12 md:py-16 bg-background overflow-hidden", className)}>
      <div className="w-full px-4">
        {/* Title */}
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-light text-foreground italic">
            {title}
            <br />
            {subtitle}
          </h2>
        </div>

        {/* Mobile Grid - Simple 4-column layout without edge effects */}
        <div className="md:hidden">
          <div className="flex justify-center">
            <div className={cn("grid grid-cols-4 max-w-sm mx-auto", sizeConfig.gap)}>
              {logos.slice(0, 12).map((logo, index) => (
                <div
                  key={`mobile-logo-${index}`}
                  className={cn(
                    sizeConfig.cell,
                    "rounded-xl bg-card border border-border flex items-center justify-center hover:bg-accent hover:border-ring transition-all duration-300 cursor-pointer group"
                  )}
                  title={logo.name}
                >
                  <div className={cn(
                    sizeConfig.icon,
                    "transform group-hover:scale-110 transition-transform duration-300 flex items-center justify-center [&>svg]:w-full [&>svg]:h-full"
                  )}>
                    {logo.icon}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tablet Grid - 8-column layout with minimal edge effects */}
        <div className="hidden md:block lg:hidden">
          <div className="relative">
            {/* Left blur gradient */}
            <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
            
            {/* Right blur gradient */}
            <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
            
            <div className="flex justify-center">
              <div className={cn("grid grid-cols-8 max-w-3xl mx-auto", sizeConfig.gap)}>
                {/* Row 1 */}
                {logos.slice(0, 8).map((logo, index) => (
                  <div
                    key={`tablet-logo-1-${index}`}
                    className={cn(
                      sizeConfig.cell,
                      "rounded-xl bg-card border border-border flex items-center justify-center hover:bg-accent hover:border-ring transition-all duration-300 cursor-pointer group"
                    )}
                    title={logo.name}
                  >
                    <div className={cn(
                      sizeConfig.icon,
                      "transform group-hover:scale-110 transition-transform duration-300 flex items-center justify-center [&>svg]:w-full [&>svg]:h-full"
                    )}>
                      {logo.icon}
                    </div>
                  </div>
                ))}
                {/* Row 2 */}
                {logos.slice(8, 16).map((logo, index) => (
                  <div
                    key={`tablet-logo-2-${index}`}
                    className={cn(
                      sizeConfig.cell,
                      "rounded-xl bg-card border border-border flex items-center justify-center hover:bg-accent hover:border-ring transition-all duration-300 cursor-pointer group"
                    )}
                    title={logo.name}
                  >
                    <div className={cn(
                      sizeConfig.icon,
                      "transform group-hover:scale-110 transition-transform duration-300 flex items-center justify-center [&>svg]:w-full [&>svg]:h-full"
                    )}>
                      {logo.icon}
                    </div>
                  </div>
                ))}
                {/* Row 3 - centered 2 logos with empty cells */}
                <div className={cn(sizeConfig.cell, "rounded-xl bg-muted/60 dark:bg-muted/30 border border-border/50 dark:border-border/30")} />
                <div className={cn(sizeConfig.cell, "rounded-xl bg-muted/60 dark:bg-muted/30 border border-border/50 dark:border-border/30")} />
                <div className={cn(sizeConfig.cell, "rounded-xl bg-muted/60 dark:bg-muted/30 border border-border/50 dark:border-border/30")} />
                {logos.slice(16, 18).map((logo, index) => (
                  <div
                    key={`tablet-logo-3-${index}`}
                    className={cn(
                      sizeConfig.cell,
                      "rounded-xl bg-card border border-border flex items-center justify-center hover:bg-accent hover:border-ring transition-all duration-300 cursor-pointer group"
                    )}
                    title={logo.name}
                  >
                    <div className={cn(
                      sizeConfig.icon,
                      "transform group-hover:scale-110 transition-transform duration-300 flex items-center justify-center [&>svg]:w-full [&>svg]:h-full"
                    )}>
                      {logo.icon}
                    </div>
                  </div>
                ))}
                <div className={cn(sizeConfig.cell, "rounded-xl bg-muted/60 dark:bg-muted/30 border border-border/50 dark:border-border/30")} />
                <div className={cn(sizeConfig.cell, "rounded-xl bg-muted/60 dark:bg-muted/30 border border-border/50 dark:border-border/30")} />
                <div className={cn(sizeConfig.cell, "rounded-xl bg-muted/60 dark:bg-muted/30 border border-border/50 dark:border-border/30")} />
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Grid - Full 14-column layout with edge blur effects */}
        <div className="hidden lg:block">
          <div className="relative">
            {/* Left blur gradient */}
            <div className="absolute left-0 top-0 bottom-0 w-16 xl:w-28 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
            
            {/* Right blur gradient */}
            <div className="absolute right-0 top-0 bottom-0 w-16 xl:w-28 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
            
            <div className="flex justify-center">
              <div className={cn("grid grid-cols-14 w-full max-w-6xl", sizeConfig.gap)}>
                {desktopGridPattern.map((cell, index) => {
                  // Edge cells - subtly visible boxes at the far edges
                  if (cell.type === "edge") {
                    return (
                      <div
                        key={`edge-${index}`}
                        className={cn(
                          sizeConfig.cell,
                          "rounded-xl bg-muted/40 dark:bg-muted/20 border border-border/30 dark:border-border/20"
                        )}
                        style={{ opacity: clampedOpacity / 100 }}
                      />
                    );
                  }
                  
                  // Empty placeholder cells
                  if (cell.type === "empty") {
                    return (
                      <div
                        key={`empty-${index}`}
                        className={cn(
                          sizeConfig.cell,
                          "rounded-xl bg-muted/60 dark:bg-muted/30 border border-border/50 dark:border-border/30"
                        )}
                      />
                    );
                  }

                  const logo = logos[cell.index as number];
                  if (!logo) {
                    return (
                      <div
                        key={`missing-${index}`}
                        className={cn(
                          sizeConfig.cell,
                          "rounded-xl bg-muted/60 dark:bg-muted/30 border border-border/50 dark:border-border/30"
                        )}
                      />
                    );
                  }

                  // Logo cells with icons
                  return (
                    <div
                      key={`logo-${cell.index}`}
                      className={cn(
                        sizeConfig.cell,
                        "rounded-xl bg-card border border-border flex items-center justify-center hover:bg-accent hover:border-ring transition-all duration-300 cursor-pointer group"
                      )}
                      title={logo.name}
                    >
                      <div className={cn(
                        sizeConfig.icon,
                        "transform group-hover:scale-110 transition-transform duration-300 flex items-center justify-center [&>svg]:w-full [&>svg]:h-full"
                      )}>
                        {logo.icon}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default LogoCloud;
