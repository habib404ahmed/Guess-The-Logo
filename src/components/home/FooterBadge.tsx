/**
 * FooterBadge
 *
 * Subtle event branding at the bottom of the home screen.
 * Small enough to not distract, visible enough to feel official.
 */
export function FooterBadge() {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex items-center gap-3">
        <div className="h-px w-8 bg-white/10" />
        <span className="text-caption text-[#475569]">
          Freshers Orientation &nbsp;·&nbsp; 2026
        </span>
        <div className="h-px w-8 bg-white/10" />
      </div>
      <p className="text-caption text-[#2d3f60]">
        Select a challenge to begin
      </p>
    </div>
  );
}
