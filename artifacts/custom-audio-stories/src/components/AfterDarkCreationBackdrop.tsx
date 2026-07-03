import { CreationRoomHero } from "@/components/CreationRoomHero";

/**
 * Full-bleed cinematic backdrop for the After Dark creation funnel —
 * pairing, scenario pick, and casting steps.
 */
export function AfterDarkCreationBackdrop() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none select-none" aria-hidden>
      <CreationRoomHero variant="mobile" />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(3,1,2,0.72) 0%, rgba(5,2,4,0.88) 45%, rgba(8,2,5,0.94) 100%)",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 0%, rgba(192,57,43,0.22) 0%, transparent 55%)",
        }}
      />
    </div>
  );
}
